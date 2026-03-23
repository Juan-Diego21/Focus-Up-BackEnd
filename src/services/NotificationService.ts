import { LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { NotificacionesProgramadasEntity } from "../models/NotificacionesProgramadas.entity";
import { UserEntity } from "../models/User.entity";
import { SesionConcentracionEntity } from "../models/SesionConcentracion.entity";
import { NotificacionesUsuarioEntity } from "../models/NotificacionesUsuario.entity";
import logger from "../utils/logger";

export interface SessionNotificationScheduleResult {
  success: boolean;
  data?: NotificacionesProgramadasEntity;
  skippedByPreference?: boolean;
  duplicated?: boolean;
  error?: string;
  message?: string;
}

/**
 * Servicio para la gestion de notificaciones programadas de sesiones.
 * Se enfoca en reglas de negocio de sesiones pendientes y evita side-effects ambiguos.
 */
export class NotificationService {
  private readonly notificationRepository = AppDataSource.getRepository(
    NotificacionesProgramadasEntity
  );
  private readonly userRepository = AppDataSource.getRepository(UserEntity);
  private readonly sessionRepository = AppDataSource.getRepository(
    SesionConcentracionEntity
  );
  private readonly preferencesRepository = AppDataSource.getRepository(
    NotificacionesUsuarioEntity
  );

  /**
   * Calcula inicio y fin de semana para validar duplicados semanales.
   */
  private buildWeekBounds(referenceDate: Date): { weekStart: Date; weekEnd: Date } {
    const weekStart = new Date(referenceDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  }

  /**
   * Busca una notificacion pendiente para la misma sesion en la misma semana.
   */
  private async findWeeklyDuplicate(
    userId: number,
    sessionId: number,
    scheduledAt: Date
  ): Promise<NotificacionesProgramadasEntity | null> {
    const { weekStart, weekEnd } = this.buildWeekBounds(scheduledAt);
    const compactPattern = `%"sessionId":${sessionId}%`;
    const spacedPattern = `%"sessionId": ${sessionId}%`;

    return this.notificationRepository
      .createQueryBuilder("n")
      .where("n.idUsuario = :userId", { userId })
      .andWhere("n.tipo = :tipo", { tipo: "sesion_pendiente" })
      .andWhere("n.enviada = false")
      .andWhere("n.fechaProgramada BETWEEN :weekStart AND :weekEnd", {
        weekStart,
        weekEnd,
      })
      .andWhere(
        "(n.mensaje LIKE :compactPattern OR n.mensaje LIKE :spacedPattern)",
        { compactPattern, spacedPattern }
      )
      .getOne();
  }

  /**
   * Crea una notificacion programada para una sesion pendiente.
   * Devuelve un resultado explicito para distinguir creada, duplicada u omitida por preferencia.
   */
  async createScheduledNotification({
    userId,
    sessionId,
    title,
    message,
    scheduledAt,
  }: {
    userId: number;
    sessionId: number;
    title: string;
    message: string;
    scheduledAt: Date;
  }): Promise<SessionNotificationScheduleResult> {
    logger.info(
      `Creando notificacion programada para usuario ${userId}, sesion ${sessionId}`
    );

    const [usuario, sesion] = await Promise.all([
      this.userRepository.findOne({ where: { idUsuario: userId } }),
      this.sessionRepository.findOne({
        where: { idSesion: sessionId, idUsuario: userId },
      }),
    ]);

    if (!usuario) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if (!sesion) {
      return {
        success: false,
        error: "Sesion no encontrada o no pertenece al usuario",
      };
    }

    const preferencias = await this.preferencesRepository.findOne({
      where: { idUsuario: userId },
    });
    const sesionesHabilitadas = preferencias?.sesionesPendientes ?? true;

    if (!sesionesHabilitadas) {
      logger.info(
        `Notificaciones de sesiones pendientes desactivadas para usuario ${userId}`
      );
      return {
        success: true,
        skippedByPreference: true,
        message: "Notificacion omitida por preferencia del usuario",
      };
    }

    const existingNotification = await this.findWeeklyDuplicate(
      userId,
      sessionId,
      scheduledAt
    );

    if (existingNotification) {
      logger.info(
        `Notificacion duplicada detectada para usuario ${userId}, sesion ${sessionId}`
      );
      return {
        success: true,
        duplicated: true,
        data: existingNotification,
        message: "Notificacion ya programada para esta semana",
      };
    }

    const { weekStart } = this.buildWeekBounds(scheduledAt);
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

    logger.info("Notificacion programada creada exitosamente", {
      notificationId: savedNotification.idNotificacion,
      scheduledAt,
    });

    return {
      success: true,
      data: savedNotification,
      message: "Notificacion programada creada correctamente",
    };
  }

  /**
   * Verifica si ya existe una notificacion para una sesion en una semana especifica.
   * Se mantiene por compatibilidad con llamadas existentes.
   */
  async checkDuplicateScheduledNotification(
    sessionId: number,
    weekStart: Date
  ): Promise<boolean> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const compactPattern = `%"sessionId":${sessionId}%`;
    const spacedPattern = `%"sessionId": ${sessionId}%`;

    const count = await this.notificationRepository
      .createQueryBuilder("n")
      .where("n.tipo = :tipo", { tipo: "sesion_pendiente" })
      .andWhere("n.enviada = false")
      .andWhere("n.fechaProgramada BETWEEN :weekStart AND :weekEnd", {
        weekStart,
        weekEnd,
      })
      .andWhere(
        "(n.mensaje LIKE :compactPattern OR n.mensaje LIKE :spacedPattern)",
        { compactPattern, spacedPattern }
      )
      .getCount();

    return count > 0;
  }

  /**
   * Procesa notificaciones pendientes y las marca como enviadas.
   * Consulta por fecha menor o igual a ahora para evitar perder pendientes.
   */
  async processPendingNotifications(): Promise<void> {
    logger.info("Procesando notificaciones pendientes de sesiones");

    const now = new Date();
    const pendingNotifications = await this.notificationRepository.find({
      where: {
        enviada: false,
        fechaProgramada: LessThanOrEqual(now),
      },
      relations: ["usuario"],
      order: { fechaProgramada: "ASC" },
    });

    logger.info(
      `Encontradas ${pendingNotifications.length} notificaciones pendientes`
    );

    for (const notification of pendingNotifications) {
      try {
        // Este servicio no envia correo directamente; solo marca como enviada
        // para mantener compatibilidad con flujos legacy.
        notification.enviada = true;
        notification.fechaEnvio = now;

        await this.notificationRepository.save(notification);

        logger.info(
          `Notificacion ${notification.idNotificacion} procesada y marcada como enviada`
        );
      } catch (error) {
        logger.error(
          `Error procesando notificacion ${notification.idNotificacion}`,
          { error }
        );
      }
    }
  }
}
