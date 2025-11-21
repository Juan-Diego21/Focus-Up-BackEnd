import { NotificacionesProgramadasRepository, createScheduledNotification, getPendingNotifications, markAsSent } from '../repositories/NotificacionesProgramadasRepository';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../models/User.entity';
import { NotificacionesUsuarioEntity } from '../models/NotificacionesUsuario.entity';
import { MetodoRealizadoEntity } from '../models/MetodoRealizado.entity';
import { getWeeklyMotivationalMessage, getCurrentWeekNumber } from '../config/motivationalMessages';
import logger from '../utils/logger';

// Repositorio de usuarios para validaciones
const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * Interfaz para crear una notificación programada
 * Define los campos requeridos para programar una nueva notificación
 */
export interface ICreateNotificacion {
  idUsuario: number;
  tipo: string;
  titulo?: string;
  mensaje?: string;
  fechaProgramada: Date;
}

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
  async createScheduledNotification(data: ICreateNotificacion) {
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
       const today = new Date(now);
       today.setHours(0, 0, 0, 0);

       const allNotifications = [];

       // 1. EVENT NOTIFICATIONS - Eventos próximos con notificaciones
       try {
         const eventos = await AppDataSource.getRepository('EventoEntity')
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
             const eventDateTime = new Date(`${evento.fechaEvento}T${evento.horaEvento}`);

             if (isNaN(eventDateTime.getTime())) {
               logger.warn(`Fecha/hora inválida para evento ${evento.idEvento}: ${evento.fechaEvento}T${evento.horaEvento}`);
               continue;
             }

             const eventDate = new Date(evento.fechaEvento + 'T00:00:00');
             let notificationTime: Date;

             if (eventDate.getTime() === today.getTime()) {
               notificationTime = new Date(eventDateTime);
               logger.debug(`Evento ${evento.idEvento} es hoy - notificación a las ${evento.horaEvento}`);
             } else {
               notificationTime = new Date(eventDateTime.getTime() - 10 * 60 * 1000);
               logger.debug(`Evento ${evento.idEvento} es futuro - notificación 10 min antes: ${notificationTime}`);
             }

             if (notificationTime >= now) {
               // Create stored notification for email delivery
               try {
                 await this.createScheduledNotification({
                   idUsuario: userId,
                   tipo: 'evento',
                   titulo: `Recordatorio: ${evento.nombreEvento}`,
                   mensaje: JSON.stringify({
                     nombreEvento: evento.nombreEvento,
                     fechaEvento: evento.fechaEvento,
                     horaEvento: evento.horaEvento,
                     descripcionEvento: evento.descripcionEvento,
                     metodoEstudio: evento.metodoEstudio?.nombreMetodo,
                     album: evento.album?.nombreAlbum
                   }),
                   fechaProgramada: notificationTime
                 });
                 logger.debug(`Stored notification created for event ${evento.idEvento}`);
               } catch (storeError) {
                 logger.error(`Failed to create stored notification for event ${evento.idEvento}:`, storeError);
               }

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
                 notificationRule: eventDate.getTime() === today.getTime() ? 'same_day' : 'future_10min_before'
               });
             }
           } catch (error) {
             logger.error(`Error procesando evento ${evento.idEvento}:`, error);
           }
         }
       } catch (error) {
         logger.error(`Error obteniendo notificaciones de eventos para usuario ${userId}:`, error);
       }

       // 2. STUDY METHOD REMINDERS - Métodos con progreso < 100% y > 7 días
       try {
         const sevenDaysAgo = new Date();
         sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

         const metodosIncompletos = await AppDataSource.getRepository('MetodoRealizadoEntity')
           .createQueryBuilder("mr")
           .leftJoinAndSelect("mr.metodo", "m")
           .where("mr.id_usuario = :userId", { userId })
           .andWhere("mr.progreso < :completado", { completado: 100 })
           .andWhere("mr.fecha_creacion <= :sevenDaysAgo", { sevenDaysAgo })
           .orderBy("mr.fecha_creacion", "ASC")
           .getMany();

         logger.info(`Encontrados ${metodosIncompletos.length} métodos incompletos para recordatorios`);

         for (const metodo of metodosIncompletos) {
           try {
             // Para métodos incompletos, mostrar recordatorio inmediato (próximos 24 horas)
             const notificationTime = new Date(now);
             notificationTime.setHours(notificationTime.getHours() + 1); // Recordatorio en 1 hora

             // Create stored notification for email delivery
             try {
               await this.createScheduledNotification({
                 idUsuario: userId,
                 tipo: 'metodo_pendiente',
                 titulo: 'Recordatorio de método pendiente',
                 mensaje: JSON.stringify({
                   nombreMetodo: metodo.metodo?.nombreMetodo || 'Método desconocido',
                   progreso: metodo.progreso,
                   idMetodoRealizado: metodo.idMetodoRealizado
                 }),
                 fechaProgramada: notificationTime
               });
               logger.debug(`Stored notification created for incomplete method ${metodo.idMetodoRealizado}`);
             } catch (storeError) {
               logger.error(`Failed to create stored notification for method ${metodo.idMetodoRealizado}:`, storeError);
             }

             allNotifications.push({
               type: 'incomplete_study_method',
               idReporte: metodo.idMetodoRealizado,
               nombreMetodo: metodo.metodo?.nombreMetodo || 'Método desconocido',
               progreso: metodo.progreso,
               notificationTime: notificationTime.toISOString()
             });

             logger.debug(`Recordatorio agregado para método incompleto ${metodo.idMetodoRealizado} (${metodo.progreso}%)`);
           } catch (error) {
             logger.error(`Error procesando recordatorio de método ${metodo.idMetodoRealizado}:`, error);
           }
         }
       } catch (error) {
         logger.error(`Error obteniendo recordatorios de métodos para usuario ${userId}:`, error);
       }

       // 3. WEEKLY MOTIVATIONAL NOTIFICATIONS - Una por semana
       try {
         // Verificar si el usuario tiene habilitadas las notificaciones motivacionales
         const notificacionesUsuario = await AppDataSource.getRepository('NotificacionesUsuarioEntity')
           .findOne({
             where: { idUsuario: userId, motivacion: true }
           });

         if (notificacionesUsuario) {
           // Calcular la próxima notificación semanal (7 días desde ahora)
           const notificationTime = new Date();
           notificationTime.setDate(notificationTime.getDate() + 7);

           // Obtener número de semana actual para seleccionar mensaje
           const currentWeek = getCurrentWeekNumber();

           allNotifications.push({
             type: 'weekly_motivation',
             notificationTime: notificationTime.toISOString(),
             templateId: currentWeek
           });

           logger.debug(`Notificación motivacional semanal programada para usuario ${userId} en semana ${currentWeek}`);
         }
       } catch (error) {
         logger.error(`Error obteniendo notificaciones motivacionales para usuario ${userId}:`, error);
       }

       // Ordenar todas las notificaciones por tiempo
       allNotifications.sort((a, b) => new Date(a.notificationTime).getTime() - new Date(b.notificationTime).getTime());

       logger.info(`Retornando ${allNotifications.length} notificaciones programadas totales para usuario ${userId}`);

       return {
         success: true,
         data: allNotifications
       };
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
   * Regla de negocio: un email por semana exactamente 7 días después de la ejecución
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

      // Para cada usuario suscrito, programar email motivacional
      for (const notificacionUsuario of usuariosSuscritos) {
        try {
          // Calcular fecha de envío: exactamente 7 días desde ahora
          const fechaEnvio = new Date();
          fechaEnvio.setDate(fechaEnvio.getDate() + 7);

          // Programar la notificación motivacional
          await this.createScheduledNotification({
            idUsuario: notificacionUsuario.idUsuario,
            tipo: "motivation",
            titulo: "Weekly Motivation",
            mensaje: mensajeSemanal,
            fechaProgramada: fechaEnvio
          });

          programadas++;
          logger.debug(`Email motivacional programado para usuario ${notificacionUsuario.idUsuario} en ${fechaEnvio}`);
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