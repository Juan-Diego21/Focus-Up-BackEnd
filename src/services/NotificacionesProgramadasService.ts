import { NotificacionesProgramadasRepository, createScheduledNotification, getPendingNotifications, markAsSent } from '../repositories/NotificacionesProgramadasRepository';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../models/User.entity';
import { NotificacionesUsuarioEntity } from '../models/NotificacionesUsuario.entity';
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
    * Obtiene eventos próximos con sus tiempos de notificación calculados
    * Retorna eventos cuya NotificationTime >= ahora y estado es null o 'pendiente'
    * Calcula correctamente los tiempos de notificación según reglas de negocio
    */
  async getUpcomingEventsWithNotifications(userId: number) {
    try {
      logger.info(`Consultando eventos próximos para usuario ${userId}`);

      // Obtener eventos del usuario que no están completados
      const eventos = await AppDataSource.getRepository('EventoEntity')
        .createQueryBuilder("evento")
        .leftJoinAndSelect("evento.metodoEstudio", "metodo")
        .leftJoinAndSelect("evento.album", "album")
        .where("evento.id_usuario = :userId", { userId })
        .andWhere("(evento.estado IS NULL OR evento.estado = :pendiente)", { pendiente: 'pendiente' })
        .orderBy("evento.fecha_evento", "ASC")
        .addOrderBy("evento.hora_evento", "ASC")
        .getMany();

      logger.info(`Encontrados ${eventos.length} eventos pendientes/completados para usuario ${userId}`);

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const eventosConNotificaciones = [];

      for (const evento of eventos) {
        try {
          // Combinar fecha y hora del evento de manera segura
          const eventDateTime = new Date(`${evento.fechaEvento}T${evento.horaEvento}`);

          if (isNaN(eventDateTime.getTime())) {
            logger.warn(`Fecha/hora inválida para evento ${evento.idEvento}: ${evento.fechaEvento}T${evento.horaEvento}`);
            continue;
          }

          // Obtener fecha del evento (solo fecha, sin hora)
          const eventDate = new Date(evento.fechaEvento + 'T00:00:00');

          // Calcular tiempo de notificación según reglas de negocio
          let notificationTime: Date;

          if (eventDate.getTime() === today.getTime()) {
            // Evento hoy: notificación a la hora exacta del evento
            notificationTime = new Date(eventDateTime);
            logger.debug(`Evento ${evento.idEvento} es hoy - notificación a las ${evento.horaEvento}`);
          } else {
            // Evento futuro: notificación 10 minutos antes
            notificationTime = new Date(eventDateTime.getTime() - 10 * 60 * 1000); // 10 minutos en ms
            logger.debug(`Evento ${evento.idEvento} es futuro - notificación 10 min antes: ${notificationTime}`);
          }

          // Solo incluir si el tiempo de notificación está en el futuro o es ahora
          if (notificationTime >= now) {
            eventosConNotificaciones.push({
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
              fechaCreacion: evento.fechaCreacion,
              fechaActualizacion: evento.fechaActualizacion,
              notificationTime: notificationTime.toISOString(),
              notificationRule: eventDate.getTime() === today.getTime() ? 'same_day' : 'future_10min_before'
            });
          } else {
            logger.debug(`Evento ${evento.idEvento} - tiempo de notificación ${notificationTime} ya pasó`);
          }

        } catch (error) {
          logger.error(`Error procesando evento ${evento.idEvento}:`, error);
        }
      }

      logger.info(`Retornando ${eventosConNotificaciones.length} eventos con notificaciones futuras`);

      return {
        success: true,
        data: eventosConNotificaciones
      };
    } catch (error) {
      logger.error(`Error al obtener eventos próximos para usuario ${userId}:`, error);
      return {
        success: false,
        error: 'Error interno al obtener eventos próximos'
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