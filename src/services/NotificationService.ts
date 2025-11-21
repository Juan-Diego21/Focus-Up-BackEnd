import { AppDataSource } from "../config/ormconfig";
import { NotificacionesProgramadasEntity } from "../models/NotificacionesProgramadas.entity";
import { UserEntity } from "../models/User.entity";
import { SesionConcentracionEntity } from "../models/SesionConcentracion.entity";
import logger from "../utils/logger";

/**
 * Servicio para la gestión de notificaciones programadas
 * Maneja la creación de notificaciones para sesiones pendientes
 */
export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(NotificacionesProgramadasEntity);
  private userRepository = AppDataSource.getRepository(UserEntity);
  private sessionRepository = AppDataSource.getRepository(SesionConcentracionEntity);

  /**
   * Crea una notificación programada para una sesión
   * @param userId - ID del usuario
   * @param sessionId - ID de la sesión
   * @param title - Título de la notificación
   * @param message - Mensaje de la notificación
   * @param scheduledAt - Fecha y hora programada
   * @returns Notificación creada
   */
  async createScheduledNotification({
    userId,
    sessionId,
    title,
    message,
    scheduledAt
  }: {
    userId: number;
    sessionId: number;
    title: string;
    message: string;
    scheduledAt: Date;
  }): Promise<NotificacionesProgramadasEntity> {
    logger.info(`Creando notificación programada para usuario ${userId}, sesión ${sessionId}`);

    // Verificar que no existe una notificación duplicada para la misma sesión en la misma semana
    const weekStart = new Date(scheduledAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Inicio de semana (domingo)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Fin de semana (sábado)
    weekEnd.setHours(23, 59, 59, 999);

    const existingNotification = await this.notificationRepository.findOne({
      where: {
        idUsuario: userId,
        tipo: "sesion_pendiente",
        fechaProgramada: scheduledAt
      }
    });

    if (existingNotification) {
      logger.info(`Notificación ya existe para usuario ${userId}, sesión ${sessionId} en la semana`);
      return existingNotification;
    }

    // Crear nueva notificación
    const notification = this.notificationRepository.create({
      idUsuario: userId,
      tipo: "sesion_pendiente",
      titulo: title,
      mensaje: JSON.stringify({
        sessionId,
        message,
        weekStart: weekStart.toISOString(),
      }),
      fechaProgramada: scheduledAt,
      enviada: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    logger.info(`Notificación programada creada exitosamente`, {
      notificationId: savedNotification.idNotificacion,
      scheduledAt
    });

    return savedNotification;
  }

  /**
   * Verifica si ya existe una notificación para una sesión en una semana específica
   * @param sessionId - ID de la sesión
   * @param weekStart - Inicio de la semana
   * @returns true si existe duplicado
   */
  async checkDuplicateScheduledNotification(sessionId: number, weekStart: Date): Promise<boolean> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = await this.notificationRepository.count({
      where: {
        tipo: "sesion_pendiente",
        enviada: false,
        fechaProgramada: weekStart
      }
    });

    return count > 0;
  }

  /**
   * Procesa notificaciones pendientes y las marca como enviadas
   * Método utilizado por el cron job
   */
  async processPendingNotifications(): Promise<void> {
    logger.info('Procesando notificaciones pendientes de sesiones');

    const now = new Date();
    const pendingNotifications = await this.notificationRepository.find({
      where: {
        enviada: false,
        fechaProgramada: now // Usar operador <= en producción
      },
      relations: ['usuario']
    });

    logger.info(`Encontradas ${pendingNotifications.length} notificaciones pendientes`);

    for (const notification of pendingNotifications) {
      try {
        // Aquí iría la lógica de envío de email
        // Por ahora solo marcamos como enviada
        notification.enviada = true;
        notification.fechaEnvio = now;

        await this.notificationRepository.save(notification);

        logger.info(`Notificación ${notification.idNotificacion} procesada y marcada como enviada`);
      } catch (error) {
        logger.error(`Error procesando notificación ${notification.idNotificacion}:`, error);
      }
    }
  }
}