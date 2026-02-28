import nodemailer from "nodemailer";
import { AppDataSource } from "../config/ormconfig";
import { getWeeklyMotivationalMessage, getCurrentWeekNumber } from "../config/motivationalMessages";
import { getPendingNotifications, markAsSent } from "../repositories/NotificacionesProgramadasRepository";
import logger from "../utils/logger";

type NotificationKind = "evento" | "metodo_pendiente" | "sesion_pendiente" | "motivation" | string;

interface EmailPayload {
  subject: string;
  html: string;
}

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_BATCH_SIZE = 50;
const ADVISORY_LOCK_KEY = 8_775_311;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const parseInteger = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return fallback;
};

const isTestRecipient = (email: string): boolean => {
  return email === "john@example.com" || email === "test@example.com";
};

const parseMessageAsJson = (message?: string): Record<string, unknown> | null => {
  if (!message) return null;
  try {
    return JSON.parse(message) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const buildEmailPayload = (kind: NotificationKind, title?: string, message?: string): EmailPayload => {
  const parsed = parseMessageAsJson(message);

  if (kind === "evento") {
    const eventName = asString(parsed?.nombreEvento, title || "Evento");
    const eventDate = asString(parsed?.fechaEvento, "");
    const eventTime = asString(parsed?.horaEvento, "");
    const eventDescription = asString(parsed?.descripcionEvento, message || "");
    return {
      subject: `Recordatorio: ${eventName}`,
      html: `
        <h2>Recordatorio de evento</h2>
        <p><strong>${eventName}</strong></p>
        <p>Fecha: ${eventDate || "Por definir"}</p>
        <p>Hora: ${eventTime || "Por definir"}</p>
        <p>${eventDescription}</p>
      `,
    };
  }

  if (kind === "metodo_pendiente") {
    const methodName = asString(parsed?.nombreMetodo, "Metodo de estudio");
    const progress = asNumber(parsed?.progreso, 0);
    return {
      subject: "Recordatorio: Metodo de estudio pendiente",
      html: `
        <h2>Continua tu metodo de estudio</h2>
        <p>Metodo: <strong>${methodName}</strong></p>
        <p>Progreso actual: <strong>${progress}%</strong></p>
      `,
    };
  }

  if (kind === "sesion_pendiente") {
    const sessionName = asString(parsed?.message, title || "Sesion de concentracion");
    return {
      subject: "Recordatorio: Sesion de concentracion pendiente",
      html: `
        <h2>Sesion pendiente</h2>
        <p>${sessionName}</p>
      `,
    };
  }

  if (kind === "motivation") {
    const currentWeek = getCurrentWeekNumber();
    const motivationalMessage = getWeeklyMotivationalMessage(currentWeek);
    return {
      subject: "Motivacion semanal - Focus-Up",
      html: `
        <h2>Mensaje motivacional de la semana</h2>
        <p>${motivationalMessage}</p>
      `,
    };
  }

  return {
    subject: title || "Notificacion Focus-Up",
    html: `<p>${message || "Tienes una notificacion pendiente."}</p>`,
  };
};

const sendEmail = async (to: string, payload: EmailPayload): Promise<boolean> => {
  try {
    if (isTestRecipient(to)) {
      logger.info(`Email scheduler: destinatario de prueba omitido (${to})`);
      return true;
    }

    await transporter.sendMail({
      from: `"Focus-Up" <${process.env.EMAIL_USER}>`,
      to,
      subject: payload.subject,
      html: payload.html,
    });

    return true;
  } catch (error) {
    logger.error("Email scheduler: error enviando correo", { to, error });
    return false;
  }
};

const tryAcquireGlobalLock = async (): Promise<boolean> => {
  const rows = await AppDataSource.query("SELECT pg_try_advisory_lock($1) AS locked", [ADVISORY_LOCK_KEY]);
  return Boolean(rows?.[0]?.locked);
};

const releaseGlobalLock = async (): Promise<void> => {
  await AppDataSource.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_KEY]);
};

export class PendingEmailScheduler {
  private readonly intervalMs: number;
  private readonly batchSize: number;
  private readonly enabled: boolean;
  private timer: NodeJS.Timeout | null = null;
  private started = false;
  private stopping = false;
  private running = false;
  private currentRun: Promise<void> | null = null;

  constructor() {
    this.intervalMs = parseInteger(process.env.EMAIL_SCHEDULER_INTERVAL_MS, DEFAULT_INTERVAL_MS);
    this.batchSize = parseInteger(process.env.EMAIL_SCHEDULER_BATCH_SIZE, DEFAULT_BATCH_SIZE);
    this.enabled = parseBoolean(process.env.EMAIL_SCHEDULER_ENABLED, true);
  }

  public async start(): Promise<void> {
    if (this.started) return;

    if (!this.enabled) {
      logger.info("Email scheduler deshabilitado por configuracion");
      return;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn("Email scheduler deshabilitado: faltan EMAIL_USER/EMAIL_PASS");
      return;
    }

    this.started = true;
    this.stopping = false;
    logger.info("Email scheduler iniciado", {
      intervalMs: this.intervalMs,
      batchSize: this.batchSize,
    });

    this.scheduleNext(1_000);
  }

  public async stop(): Promise<void> {
    if (!this.started) return;

    this.stopping = true;
    this.started = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.currentRun) {
      await this.currentRun;
    }

    logger.info("Email scheduler detenido");
  }

  private scheduleNext(delayMs: number): void {
    if (this.stopping) return;

    this.timer = setTimeout(() => {
      void this.tick();
    }, delayMs);
    this.timer.unref?.();
  }

  private async tick(): Promise<void> {
    if (this.stopping) return;

    if (this.running) {
      logger.warn("Email scheduler: ciclo omitido porque el anterior sigue en ejecucion");
      this.scheduleNext(this.intervalMs);
      return;
    }

    this.running = true;
    this.currentRun = this.processCycle();

    try {
      await this.currentRun;
    } finally {
      this.running = false;
      this.currentRun = null;
      this.scheduleNext(this.intervalMs);
    }
  }

  private async processCycle(): Promise<void> {
    let lockAcquired = false;

    try {
      lockAcquired = await tryAcquireGlobalLock();
      if (!lockAcquired) {
        logger.info("Email scheduler: lock global no adquirido, se omite este ciclo");
        return;
      }

      const allPending = await getPendingNotifications();
      const pending = allPending.slice(0, this.batchSize);

      if (pending.length === 0) return;

      let sent = 0;
      let failed = 0;

      for (const notification of pending) {
        const to = notification.usuario?.correo;
        if (!to) {
          failed++;
          logger.error("Email scheduler: notificacion sin correo de usuario", {
            idNotificacion: notification.idNotificacion,
            idUsuario: notification.idUsuario,
          });
          continue;
        }

        const payload = buildEmailPayload(notification.tipo, notification.titulo, notification.mensaje);
        const delivered = await sendEmail(to, payload);

        if (!delivered) {
          failed++;
          continue;
        }

        const marked = await markAsSent(notification.idNotificacion);
        if (!marked) {
          failed++;
          logger.error("Email scheduler: no se pudo marcar notificacion como enviada", {
            idNotificacion: notification.idNotificacion,
          });
          continue;
        }

        sent++;
      }

      logger.info("Email scheduler: ciclo completado", {
        pendientesDetectadas: allPending.length,
        procesadas: pending.length,
        enviadas: sent,
        fallidas: failed,
      });
    } catch (error) {
      logger.error("Email scheduler: error en ciclo de procesamiento", { error });
    } finally {
      if (lockAcquired) {
        try {
          await releaseGlobalLock();
        } catch (unlockError) {
          logger.error("Email scheduler: error liberando lock global", { unlockError });
        }
      }
    }
  }
}
