import { NotificacionesProgramadasService } from "../services/NotificacionesProgramadasService";
import { NotificationService } from "../services/NotificationService";
import { SessionService } from "../services/SessionService";
import logger from "../utils/logger";
import {
  PendingEmailProcessorResult,
  processPendingEmailNotifications,
} from "./pendingEmailScheduler";

interface EmailAutomationConfig {
  timezone: string;
  scheduleWindowMinutes: number;
  enablePendingProcessing: boolean;
  enableSessionReminderScheduling: boolean;
  enableWeeklyMotivationScheduling: boolean;
  forceSessionReminderScheduling: boolean;
  forceWeeklyMotivationScheduling: boolean;
  sessionReminderTriggerHour: number;
  weeklyMotivationTriggerHour: number;
  sessionAgeDays: number;
}

interface SessionReminderResult {
  analyzed: number;
  scheduled: number;
  duplicates: number;
  skippedByPreference: number;
  errors: number;
}

interface WeeklyMotivationResult {
  scheduled: number;
  errors: number;
  skipped: boolean;
  details?: unknown;
}

export interface EmailAutomationResult {
  pendingProcessing?: PendingEmailProcessorResult;
  sessionReminders?: SessionReminderResult;
  weeklyMotivation?: WeeklyMotivationResult;
  executedAt: string;
  timezone: string;
}

const parseInteger = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return fallback;
};

/**
 * Lee configuración de entorno para controlar qué partes del ciclo se ejecutan.
 * Esto permite desactivar tareas o forzarlas manualmente sin cambiar código.
 */
const readConfig = (): EmailAutomationConfig => {
  const timezone = process.env.CRON_TIMEZONE || "America/Bogota";
  const scheduleWindowMinutes = Math.max(
    1,
    parseInteger(process.env.EMAIL_AUTOMATION_WINDOW_MINUTES, 5)
  );
  const sessionReminderTriggerHour = Math.min(
    23,
    Math.max(0, parseInteger(process.env.SESSION_REMINDER_TRIGGER_HOUR, 2))
  );
  const weeklyMotivationTriggerHour = Math.min(
    23,
    Math.max(0, parseInteger(process.env.WEEKLY_MOTIVATION_TRIGGER_HOUR, 9))
  );
  const sessionAgeDays = Math.max(
    1,
    parseInteger(process.env.SESSION_REMINDER_AGE_DAYS, 7)
  );

  return {
    timezone,
    scheduleWindowMinutes,
    enablePendingProcessing: parseBoolean(
      process.env.EMAIL_AUTOMATION_ENABLE_PENDING,
      true
    ),
    enableSessionReminderScheduling: parseBoolean(
      process.env.EMAIL_AUTOMATION_ENABLE_SESSION_REMINDERS,
      true
    ),
    enableWeeklyMotivationScheduling: parseBoolean(
      process.env.EMAIL_AUTOMATION_ENABLE_WEEKLY_MOTIVATION,
      true
    ),
    forceSessionReminderScheduling: parseBoolean(
      process.env.EMAIL_AUTOMATION_FORCE_SESSION_REMINDERS,
      false
    ),
    forceWeeklyMotivationScheduling: parseBoolean(
      process.env.EMAIL_AUTOMATION_FORCE_WEEKLY_MOTIVATION,
      false
    ),
    sessionReminderTriggerHour,
    weeklyMotivationTriggerHour,
    sessionAgeDays,
  };
};

const getZonedDateParts = (
  date: Date,
  timezone: string
): { hour: number; minute: number; weekday: string } => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value || "Sun";
  const hour = Number.parseInt(
    parts.find((part) => part.type === "hour")?.value || "0",
    10
  );
  const minute = Number.parseInt(
    parts.find((part) => part.type === "minute")?.value || "0",
    10
  );

  return { weekday, hour, minute };
};

/**
 * Determina si el tiempo actual está dentro de la ventana de ejecución.
 * Se usa para que un cron externo (cada 5 min) dispare tareas diarias/semanales.
 */
const shouldRunInWindow = (
  now: Date,
  timezone: string,
  triggerHour: number,
  windowMinutes: number,
  expectedWeekday?: string
): boolean => {
  const zoned = getZonedDateParts(now, timezone);
  if (expectedWeekday && zoned.weekday !== expectedWeekday) return false;
  if (zoned.hour !== triggerHour) return false;
  return zoned.minute < windowMinutes;
};

/**
 * Construye la hora objetivo de envío para recordatorios de sesión.
 * Se agenda a las 9:00 AM del día actual; si ya pasó, se programa para el día siguiente.
 */
const buildSessionReminderScheduledAt = (now: Date): Date => {
  const scheduledAt = new Date(now);
  scheduledAt.setHours(9, 0, 0, 0);

  if (scheduledAt <= now) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
  }

  return scheduledAt;
};

/**
 * Busca sesiones pendientes antiguas y crea notificaciones programadas.
 * Reutiliza SessionService y NotificationService para no duplicar reglas de negocio.
 */
export const scheduleSessionReminderNotifications = async (
  sessionAgeDays: number
): Promise<SessionReminderResult> => {
  const sessionService = new SessionService();
  const notificationService = new NotificationService();
  const pendingSessions = await sessionService.getPendingSessionsOlderThan(
    sessionAgeDays
  );

  let scheduled = 0;
  let duplicates = 0;
  let skippedByPreference = 0;
  let errors = 0;

  for (const session of pendingSessions) {
    try {
      const scheduledAt = buildSessionReminderScheduledAt(new Date());
      const scheduleResult = await notificationService.createScheduledNotification({
        userId: session.idUsuario,
        sessionId: session.idSesion,
        title: "Sesión de concentración pendiente",
        message:
          "Tienes una sesión de concentración pendiente desde hace más de una semana.",
        scheduledAt,
      });
      if (!scheduleResult.success) {
        errors++;
        logger.error("Error de negocio programando recordatorio de sesion", {
          sessionId: session.idSesion,
          userId: session.idUsuario,
          error: scheduleResult.error,
        });
        continue;
      }

      if (scheduleResult.skippedByPreference) {
        skippedByPreference++;
        continue;
      }

      if (scheduleResult.duplicated) {
        duplicates++;
        continue;
      }

      scheduled++;
    } catch (error) {
      errors++;
      logger.error("Error programando recordatorio de sesión", {
        sessionId: session.idSesion,
        userId: session.idUsuario,
        error,
      });
    }
  }

  const result: SessionReminderResult = {
    analyzed: pendingSessions.length,
    scheduled,
    duplicates,
    skippedByPreference,
    errors,
  };

  logger.info("Programación de recordatorios de sesión completada", result);
  return result;
};

/**
 * Ejecuta la programación semanal de correos motivacionales.
 * El servicio ya incluye control de duplicados por semana.
 */
export const scheduleWeeklyMotivationalEmails =
  async (): Promise<WeeklyMotivationResult> => {
    const result =
      await NotificacionesProgramadasService.scheduleWeeklyMotivationalEmails();

    if (!result.success) {
      logger.error("Falló la programación semanal motivacional", {
        error: result.error,
      });
      return {
        scheduled: 0,
        errors: 1,
        skipped: false,
      };
    }

    const scheduled = Number(
      (result.data as { programadas?: number } | undefined)?.programadas || 0
    );
    const errors = Number(
      (result.data as { errores?: number } | undefined)?.errores || 0
    );

    return {
      scheduled,
      errors,
      skipped: false,
      details: result.data,
    };
  };

/**
 * Ejecuta un ciclo completo de automatización:
 * 1) envío de pendientes, 2) recordatorios diarios, 3) motivación semanal.
 * El disparo real del tiempo lo define GitHub Actions; aquí sólo se decide
 * qué tareas tocar según ventana y zona horaria.
 */
export const runEmailAutomationCycle = async (): Promise<EmailAutomationResult> => {
  const config = readConfig();
  const now = new Date();
  const response: EmailAutomationResult = {
    executedAt: now.toISOString(),
    timezone: config.timezone,
  };

  logger.info("Iniciando ciclo de automatización de correos", {
    executedAt: response.executedAt,
    timezone: config.timezone,
    scheduleWindowMinutes: config.scheduleWindowMinutes,
  });

  if (config.enablePendingProcessing) {
    response.pendingProcessing = await processPendingEmailNotifications();
  } else {
    logger.info(
      "Automatización: envío de pendientes omitido por EMAIL_AUTOMATION_ENABLE_PENDING=false"
    );
  }

  const shouldRunSessionReminders =
    config.forceSessionReminderScheduling ||
    shouldRunInWindow(
      now,
      config.timezone,
      config.sessionReminderTriggerHour,
      config.scheduleWindowMinutes
    );

  if (config.enableSessionReminderScheduling && shouldRunSessionReminders) {
    response.sessionReminders = await scheduleSessionReminderNotifications(
      config.sessionAgeDays
    );
  } else {
    logger.info("Automatización: recordatorios de sesión omitidos", {
      enabled: config.enableSessionReminderScheduling,
      forced: config.forceSessionReminderScheduling,
      triggerHour: config.sessionReminderTriggerHour,
    });
  }

  const shouldRunWeeklyMotivation =
    config.forceWeeklyMotivationScheduling ||
    shouldRunInWindow(
      now,
      config.timezone,
      config.weeklyMotivationTriggerHour,
      config.scheduleWindowMinutes,
      "Sun"
    );

  if (config.enableWeeklyMotivationScheduling && shouldRunWeeklyMotivation) {
    response.weeklyMotivation = await scheduleWeeklyMotivationalEmails();
  } else {
    logger.info("Automatización: motivación semanal omitida", {
      enabled: config.enableWeeklyMotivationScheduling,
      forced: config.forceWeeklyMotivationScheduling,
      triggerHour: config.weeklyMotivationTriggerHour,
    });
  }

  logger.info("Ciclo de automatización finalizado", response);
  return response;
};
