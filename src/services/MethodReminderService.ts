import { AppDataSource } from "../config/ormconfig";
import { NotificacionesUsuarioEntity } from "../models/NotificacionesUsuario.entity";
import { NotificacionesProgramadasService } from "./NotificacionesProgramadasService";
import logger from "../utils/logger";

interface ScheduleMethodReminderInput {
  userId: number;
  methodReportId: number;
  methodId: number;
  methodName: string;
  progress: number;
  createdAt: Date;
}

interface ScheduleMethodReminderResult {
  attempted: boolean;
  scheduled: boolean;
  skippedByPreference: boolean;
  error?: string;
}

/**
 * Servicio especializado en programar recordatorios de metodos de estudio.
 * Aisla esta responsabilidad de ReportsService para reducir acoplamiento.
 */
export class MethodReminderService {
  private readonly preferencesRepository = AppDataSource.getRepository(
    NotificacionesUsuarioEntity
  );

  /**
   * Programa un recordatorio a 7 dias para metodos incompletos.
   * Si no aplica (preferencias desactivadas o fecha invalida), retorna un resultado explicito.
   */
  async scheduleIncompleteMethodReminder(
    input: ScheduleMethodReminderInput
  ): Promise<ScheduleMethodReminderResult> {
    if (input.progress >= 100) {
      return {
        attempted: false,
        scheduled: false,
        skippedByPreference: false,
      };
    }

    const preferencias = await this.preferencesRepository.findOne({
      where: { idUsuario: input.userId },
    });
    const metodosHabilitados = preferencias?.metodosPendientes ?? true;

    if (!metodosHabilitados) {
      logger.info(
        `Notificaciones de metodos pendientes desactivadas para usuario ${input.userId}`
      );
      return {
        attempted: true,
        scheduled: false,
        skippedByPreference: true,
      };
    }

    // Regla: recordatorio 7 dias despues de crear el metodo.
    const fechaRecordatorio = new Date(input.createdAt);
    fechaRecordatorio.setDate(fechaRecordatorio.getDate() + 7);

    if (fechaRecordatorio <= new Date()) {
      logger.warn(
        `Fecha de recordatorio no futura para metodo ${input.methodReportId}`
      );
      return {
        attempted: true,
        scheduled: false,
        skippedByPreference: false,
      };
    }

    const creationResult =
      await NotificacionesProgramadasService.createScheduledNotification({
        idUsuario: input.userId,
        tipo: "metodo_pendiente",
        titulo: "Recordatorio de metodo pendiente",
        mensaje: JSON.stringify({
          idMetodoRealizado: input.methodReportId,
          idMetodo: input.methodId,
          nombreMetodo: input.methodName,
          progreso: Number(input.progress),
        }),
        fechaProgramada: fechaRecordatorio,
      });

    if (!creationResult.success) {
      return {
        attempted: true,
        scheduled: false,
        skippedByPreference: false,
        error: creationResult.error || "Error al crear notificacion programada",
      };
    }

    return {
      attempted: true,
      scheduled: true,
      skippedByPreference: false,
    };
  }
}
