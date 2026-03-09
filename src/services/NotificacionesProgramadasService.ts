import { NotificacionesProgramadasRepository, createScheduledNotification, getPendingNotifications, markAsSent } from '../repositories/NotificacionesProgramadasRepository';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../models/User.entity';
import { NotificacionesUsuarioEntity } from '../models/NotificacionesUsuario.entity';
import { MetodoRealizadoEntity } from '../models/MetodoRealizado.entity';
import { EventoEntity } from '../models/Evento.entity';
import { getWeeklyMotivationalMessage, getCurrentWeekNumber } from '../config/motivationalMessages';
import logger from '../utils/logger';
import { ICreateScheduledNotification } from '../interfaces/domain/notifications/ICreateScheduledNotification';

// Repositorio de usuarios para validaciones
const userRepository = AppDataSource.getRepository(UserEntity);
const preferencesRepository = AppDataSource.getRepository(NotificacionesUsuarioEntity);

const EVENT_TIMEZONE_OFFSET_MINUTES = Number.parseInt(
  process.env.EVENT_TIMEZONE_OFFSET_MINUTES ?? '-300',
  10
);

const parsedWeeklyMotivationDelayMs = Number.parseInt(
  process.env.WEEKLY_MOTIVATION_DELAY_MS ?? '15000',
  10
);
const WEEKLY_MOTIVATION_DELAY_MS = Number.isFinite(parsedWeeklyMotivationDelayMs) &&
  parsedWeeklyMotivationDelayMs >= 1000
  ? parsedWeeklyMotivationDelayMs
  : 15000;

const formatYmdFromDate = (dateValue: Date): string => {
  const year = dateValue.getUTCFullYear();
  const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDatePartsInConfiguredTimezone = (date: Date) => {
  const shifted = new Date(date.getTime() + EVENT_TIMEZONE_OFFSET_MINUTES * 60000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
};

const parseLocalDateTime = (dateValue: string | Date, timeValue: string): Date | null => {
  const dateString = dateValue instanceof Date
    ? formatYmdFromDate(dateValue)
    : String(dateValue).split('T')[0];

  const dateParts = dateString.split('-').map((part) => Number.parseInt(part, 10));
  const timeParts = timeValue.split(':').map((part) => Number.parseInt(part, 10));
  if (dateParts.length !== 3 || timeParts.length < 2) return null;

  const [year, month, day] = dateParts;
  const [hour, minute, second = 0] = timeParts;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  ) {
    return null;
  }

  const utcFromConfiguredTimezone = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, 0) -
      EVENT_TIMEZONE_OFFSET_MINUTES * 60000
  );
  return Number.isNaN(utcFromConfiguredTimezone.getTime()) ? null : utcFromConfiguredTimezone;
};

/**
 * Servicio para la gestión de notificaciones programadas
 * Maneja la creación, consulta y actualización de notificaciones para envío futuro
 * Incluye validaciones de negocio, verificación de fechas y logging detallado
 */
export const NotificacionesProgramadasService = {
  /**
   * Crea una nueva notificación programada
   * Valida que el usuario exista, que la fecha sea futura y que el tipo sea válido
   * Registra la creación en los logs para auditoría
   */
  async createScheduledNotification(data: ICreateScheduledNotification) {
    try {
      logger.info(`Intentando crear notificación programada para usuario ${data.idUsuario}, tipo: ${data.tipo}`);

      // Validar que el usuario existe
      const usuario = await userRepository.findOne({ where: { idUsuario: data.idUsuario } });
      if (!usuario) {
        logger.warn(`Usuario ${data.idUsuario} no encontrado al crear notificación`);
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Validar que el tipo no esté vacío
      if (!data.tipo || data.tipo.trim().length === 0) {
        logger.warn(`Tipo de notificación vacío para usuario ${data.idUsuario}`);
        return {
          success: false,
          error: 'El tipo de notificación es requerido'
        };
      }

      // Validar que la fecha programada sea futura
      const now = new Date();
      if (data.fechaProgramada <= now) {
        logger.warn(`Fecha programada ${data.fechaProgramada} no es futura para usuario ${data.idUsuario}`);
        return {
          success: false,
          error: 'La fecha programada debe ser en el futuro'
        };
      }

      // Validar que la fecha no sea demasiado lejana (ej: máximo 1 año)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (data.fechaProgramada > oneYearFromNow) {
        logger.warn(`Fecha programada ${data.fechaProgramada} demasiado lejana para usuario ${data.idUsuario}`);
        return {
          success: false,
          error: 'La fecha programada no puede ser más de 1 año en el futuro'
        };
      }

      // Evitar duplicados exactos para reducir spam/reintentos
      const duplicate = await NotificacionesProgramadasRepository.findOne({
        where: {
          idUsuario: data.idUsuario,
          tipo: data.tipo.trim(),
          titulo: data.titulo?.trim(),
          fechaProgramada: data.fechaProgramada,
          enviada: false
        }
      });

      if (duplicate) {
        logger.info(`Notificación duplicada omitida para usuario ${data.idUsuario}, tipo: ${data.tipo}`);
        return {
          success: true,
          message: 'Notificación ya programada previamente',
          data: duplicate
        };
      }

      // Crear la notificación programada
      const nuevaNotificacion = await createScheduledNotification({
        idUsuario: data.idUsuario,
        tipo: data.tipo.trim(),
        titulo: data.titulo?.trim(),
        mensaje: data.mensaje?.trim(),
        fechaProgramada: data.fechaProgramada
      });

      logger.info(`Notificación programada creada exitosamente: ID ${nuevaNotificacion.idNotificacion} para usuario ${data.idUsuario}`);

      return {
        success: true,
        message: 'Notificación programada creada correctamente',
        data: nuevaNotificacion
      };
    } catch (error) {
      logger.error(`Error al crear notificación programada para usuario ${data.idUsuario}:`, error);
      return {
        success: false,
        error: 'Error interno al crear notificación programada'
      };
    }
  },

  /**
    * Obtiene todas las notificaciones pendientes de envío
    * Retorna notificaciones que deben ser enviadas ahora o en el pasado
    * Incluye información del usuario para el envío de emails
    */
  async getPendingNotifications() {
    try {
      logger.info('Consultando notificaciones pendientes de envío');

      const notificaciones = await getPendingNotifications();

      logger.info(`Encontradas ${notificaciones.length} notificaciones pendientes`);

      return {
        success: true,
        data: notificaciones
      };
    } catch (error) {
      logger.error('Error al obtener notificaciones pendientes:', error);
      return {
        success: false,
        error: 'Error interno al obtener notificaciones pendientes'
      };
    }
  },

  /**
     * Obtiene todas las notificaciones programadas para un usuario
     * Incluye eventos próximos, recordatorios de métodos incompletos y notificaciones motivacionales semanales
     * Retorna notificaciones cuya NotificationTime >= ahora
     */
   async getUpcomingEventsWithNotifications(userId: number) {
     try {
       logger.info(`Consultando todas las notificaciones programadas para usuario ${userId}`);

       const now = new Date();
       const todayTz = getDatePartsInConfiguredTimezone(now);

       const allNotifications: any[] = [];
       const preferencias = await preferencesRepository.findOne({ where: { idUsuario: userId } });
       const eventosEnabled = preferencias?.eventos ?? true;
       const metodosEnabled = preferencias?.metodosPendientes ?? true;
       const motivacionEnabled = preferencias?.motivacion ?? true;

       if (eventosEnabled) {
         try {
           const eventos = await AppDataSource.getRepository(EventoEntity)
             .createQueryBuilder("evento")
             .leftJoinAndSelect("evento.metodoEstudio", "metodo")
             .leftJoinAndSelect("evento.album", "album")
             .where("evento.id_usuario = :userId", { userId })
             .andWhere("(evento.estado IS NULL OR evento.estado = :pendiente)", { pendiente: 'pendiente' })
             .orderBy("evento.fecha_evento", "ASC")
             .addOrderBy("evento.hora_evento", "ASC")
             .getMany();

           logger.info(`Encontrados ${eventos.length} eventos pendientes para usuario ${userId}`);

           for (const evento of eventos) {
             try {
               const eventDateTime = parseLocalDateTime(evento.fechaEvento, evento.horaEvento);
               if (!eventDateTime) {
                 logger.warn(`Fecha/hora inválida para evento ${evento.idEvento}: ${evento.fechaEvento}T${evento.horaEvento}`);
                 continue;
               }

               const fechaEventoString = String(evento.fechaEvento).split('T')[0];
               const [eventYear, eventMonth, eventDay] = fechaEventoString
                 .split('-')
                 .map((part) => Number.parseInt(part, 10));
               const isTodayEvent =
                 Number.isFinite(eventYear) &&
                 Number.isFinite(eventMonth) &&
                 Number.isFinite(eventDay) &&
                 eventYear === todayTz.year &&
                 eventMonth === todayTz.month &&
                 eventDay === todayTz.day;
               let notificationTime: Date;

               if (isTodayEvent) {
                 notificationTime = new Date(eventDateTime);
               } else {
                 notificationTime = new Date(eventDateTime.getTime() - 10 * 60 * 1000);
               }

               if (notificationTime >= now) {
                 allNotifications.push({
                   type: 'event',
                   idEvento: evento.idEvento,
                   nombreEvento: evento.nombreEvento,
                   fechaEvento: evento.fechaEvento,
                   horaEvento: evento.horaEvento,
                   descripcionEvento: evento.descripcionEvento,
                   estado: evento.estado,
                   metodoEstudio: evento.metodoEstudio ? {
                     idMetodo: evento.metodoEstudio.idMetodo,
                     nombreMetodo: evento.metodoEstudio.nombreMetodo
                   } : null,
                   album: evento.album ? {
                     idAlbum: evento.album.idAlbum,
                     nombreAlbum: evento.album.nombreAlbum
                   } : null,
                   notificationTime: notificationTime.toISOString(),
                   notificationRule: isTodayEvent ? 'same_day' : 'future_10min_before'
                 });
               }
             } catch (error) {
               logger.error(`Error procesando evento ${evento.idEvento}:`, error);
             }
           }
         } catch (error) {
           logger.error(`Error obteniendo notificaciones de eventos para usuario ${userId}:`, error);
         }
       }

       if (metodosEnabled) {
         try {
           const sevenDaysAgo = new Date();
           sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

           const metodosIncompletos = await AppDataSource.getRepository(MetodoRealizadoEntity)
             .createQueryBuilder("mr")
             .leftJoinAndSelect("mr.metodo", "m")
             .where("mr.id_usuario = :userId", { userId })
             .andWhere("mr.progreso < :completado", { completado: 100 })
             .andWhere("mr.fecha_creacion <= :sevenDaysAgo", { sevenDaysAgo })
             .orderBy("mr.fecha_creacion", "ASC")
             .getMany();

           logger.info(`Encontrados ${metodosIncompletos.length} métodos incompletos para recordatorios`);

           for (const metodo of metodosIncompletos) {
             const notificationTime = new Date(now);
             notificationTime.setHours(notificationTime.getHours() + 1);

             allNotifications.push({
               type: 'incomplete_study_method',
               idReporte: metodo.idMetodoRealizado,
               nombreMetodo: metodo.metodo?.nombreMetodo || 'Método desconocido',
               progreso: metodo.progreso,
               notificationTime: notificationTime.toISOString()
             });
           }
         } catch (error) {
           logger.error(`Error obteniendo recordatorios de métodos para usuario ${userId}:`, error);
         }
       }

       if (motivacionEnabled) {
         const notificationTime = new Date();
         notificationTime.setDate(notificationTime.getDate() + 7);
         const currentWeek = getCurrentWeekNumber();
         allNotifications.push({
           type: 'weekly_motivation',
           notificationTime: notificationTime.toISOString(),
           templateId: currentWeek
         });
       }

       allNotifications.sort((a, b) => new Date(a.notificationTime).getTime() - new Date(b.notificationTime).getTime());

       logger.info(`Retornando ${allNotifications.length} notificaciones programadas totales para usuario ${userId}`);
       return { success: true, data: allNotifications };
     } catch (error) {
       logger.error(`Error al obtener notificaciones programadas para usuario ${userId}:`, error);
       return {
         success: false,
         error: 'Error interno al obtener notificaciones programadas'
       };
     }
   },

  /**
   * Marca una notificación específica como enviada
   * Actualiza el estado y registra la fecha de envío
   * Valida que la notificación exista antes de marcarla
   */
  async markAsSent(idNotificacion: number) {
    try {
      logger.info(`Marcando notificación ${idNotificacion} como enviada`);

      // Verificar que la notificación existe
      const notificacion = await NotificacionesProgramadasRepository.findOne({
        where: { idNotificacion }
      });

      if (!notificacion) {
        logger.warn(`Notificación ${idNotificacion} no encontrada al marcar como enviada`);
        return {
          success: false,
          error: 'Notificación no encontrada'
        };
      }

      // Verificar que no esté ya enviada
      if (notificacion.enviada) {
        logger.warn(`Notificación ${idNotificacion} ya estaba marcada como enviada`);
        return {
          success: false,
          error: 'La notificación ya fue enviada'
        };
      }

      // Marcar como enviada
      const updated = await markAsSent(idNotificacion);

      if (updated) {
        logger.info(`Notificación ${idNotificacion} marcada como enviada exitosamente`);
        return {
          success: true,
          message: 'Notificación marcada como enviada'
        };
      } else {
        logger.error(`Error al actualizar notificación ${idNotificacion}`);
        return {
          success: false,
          error: 'Error al marcar notificación como enviada'
        };
      }
    } catch (error) {
      logger.error(`Error al marcar notificación ${idNotificacion} como enviada:`, error);
      return {
        success: false,
        error: 'Error interno al marcar notificación como enviada'
      };
    }
  },

  /**
   * Programa emails motivacionales semanales para todos los usuarios suscritos
   * Sistema de rotación semanal: cada semana un mensaje diferente basado en el número de semana
   * Solo para usuarios que tienen habilitadas las notificaciones de motivación
   * Regla de negocio: un email por semana, despachado segundos después de ejecutar el cron
   */
  async scheduleWeeklyMotivationalEmails() {
    try {
      logger.info('Iniciando programación de emails motivacionales semanales');

      // Obtener número de semana actual para seleccionar mensaje
      const currentWeek = getCurrentWeekNumber();
      const mensajeSemanal = getWeeklyMotivationalMessage(currentWeek);

      logger.info(`Semana ${currentWeek}: mensaje motivacional seleccionado`);

      // Obtener todos los usuarios que tienen motivación habilitada
      const notificacionesUsuarioRepository = AppDataSource.getRepository(NotificacionesUsuarioEntity);
      const usuariosSuscritos = await notificacionesUsuarioRepository.find({
        where: { motivacion: true },
        relations: ['usuario']
      });

      logger.info(`Encontrados ${usuariosSuscritos.length} usuarios suscritos a motivación semanal`);

      let programadas = 0;
      let errores = 0;
      const now = new Date();
      const fechaEnvio = new Date(now.getTime() + WEEKLY_MOTIVATION_DELAY_MS);

      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Para cada usuario suscrito, programar email motivacional
      for (const notificacionUsuario of usuariosSuscritos) {
        try {
          // Programar para envío inmediato (con pequeño delay para cumplir validación de fecha futura)
          const existingInWeek = await NotificacionesProgramadasRepository
            .createQueryBuilder("n")
            .where("n.idUsuario = :idUsuario", { idUsuario: notificacionUsuario.idUsuario })
            .andWhere("n.tipo = :tipo", { tipo: "motivation" })
            .andWhere("n.fechaProgramada BETWEEN :weekStart AND :weekEnd", { weekStart, weekEnd })
            .getCount();

          if (existingInWeek > 0) {
            logger.debug(`Email motivacional omitido por duplicado semanal para usuario ${notificacionUsuario.idUsuario}`);
            continue;
          }

          // Programar la notificación motivacional
          const created = await this.createScheduledNotification({
            idUsuario: notificacionUsuario.idUsuario,
            tipo: "motivation",
            titulo: "Weekly Motivation",
            mensaje: mensajeSemanal,
            fechaProgramada: fechaEnvio
          });

          if (!created.success) {
            errores++;
            logger.error(`Error al programar email motivacional para usuario ${notificacionUsuario.idUsuario}: ${created.error}`);
            continue;
          }

          programadas++;
          logger.debug(`Email motivacional programado para usuario ${notificacionUsuario.idUsuario} en ${fechaEnvio.toISOString()}`);
        } catch (error) {
          errores++;
          logger.error(`Error al programar email motivacional para usuario ${notificacionUsuario.idUsuario}:`, error);
        }
      }

      logger.info(`Programación semanal completada: ${programadas} emails programados, ${errores} errores`);

      return {
        success: true,
        message: `Emails motivacionales semanales programados: ${programadas} exitosos, ${errores} errores`,
        data: {
          programadas,
          errores,
          semana: currentWeek,
          mensaje: mensajeSemanal
        }
      };
    } catch (error) {
      logger.error('Error al programar emails motivacionales semanales:', error);
      return {
        success: false,
        error: 'Error interno al programar emails motivacionales'
      };
    }
  }
};
