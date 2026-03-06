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

const readNumericId = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10);
  }

  return 0;
};

const DEV_FRONTEND_URL = "http://localhost:5173";

const getFrontendBaseUrl = (): string => {
  if ((process.env.NODE_ENV || "").toLowerCase() === "production") {
    return (process.env.FRONTEND_URL || "").trim().replace(/\/+$/, "");
  }

  return DEV_FRONTEND_URL;
};

const getFrontendEventsUrl = (): string => {
  return `${getFrontendBaseUrl()}/events`;
};

const getStartSessionUrl = (eventId: number): string => {
  return `${getFrontendBaseUrl()}/start-session?eventId=${eventId}`;
};

const normalizeStartSessionLink = (rawLink: string): string => {
  const normalized = rawLink.trim();
  if (!normalized) return "";

  const eventIdMatch = normalized.match(/[?&]eventId=(\d+)/i);
  if (eventIdMatch?.[1]) {
    const parsedEventId = Number.parseInt(eventIdMatch[1], 10);
    if (!Number.isNaN(parsedEventId) && parsedEventId > 0) {
      return getStartSessionUrl(parsedEventId);
    }
  }

  return normalized;
};

const getEventDescription = (parsed: Record<string, unknown> | null): string => {
  const description = asString(parsed?.descripcionEvento, "");
  return description || "Sin descripción";
};

const normalizeKind = (kind: NotificationKind): NotificationKind => {
  if (kind === "motivacion") return "motivation";
  return kind;
};

const wrapEmailTemplate = (title: string, subtitle: string, accentColor: string, content: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid ${accentColor};
        }
        .brand-text {
          font-size: 32px;
          font-weight: 700;
          color: #007bff;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 16px;
          color: #6c757d;
          margin: 8px 0 0 0;
          font-weight: 500;
        }
        .content {
          color: #333333;
          margin-bottom: 25px;
        }
        .box {
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid ${accentColor};
          background-color: #f8f9fa;
        }
        .highlight {
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 1px solid #d5e7ff;
          background-color: #eef5ff;
        }
        .highlight p {
          margin: 0;
          color: #0c5460;
          font-weight: 500;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
        .cta a {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 14px;
          border-radius: 6px;
          background-color: ${accentColor};
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
        }
        @media (max-width: 480px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .brand-text {
            font-size: 28px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-text">Focus-Up</h1>
          <p class="subtitle">${subtitle}</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Este es un mensaje autom&aacute;tico de Focus-Up.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const buildEmailPayload = (kind: NotificationKind, title?: string, message?: string): EmailPayload => {
  const normalizedKind = normalizeKind(kind);
  const parsed = parseMessageAsJson(message);

  if (normalizedKind === "evento") {
    const eventName = asString(parsed?.nombreEvento, title || "Evento");
    const eventDate = asString(parsed?.fechaEvento, "");
    const eventTime = asString(parsed?.horaEvento, "");
    const eventDescription = getEventDescription(parsed);
    const eventId = readNumericId(parsed?.idEvento);
    const rawEventLink = asString(parsed?.link, "");
    const eventType = asString(parsed?.tipoEvento, "").toLowerCase();
    const isConcentrationEvent = eventType === "concentracion" || rawEventLink.includes("/start-session");
    const eventLink = eventId > 0 && isConcentrationEvent
      ? getStartSessionUrl(eventId)
      : normalizeStartSessionLink(rawEventLink);

    return {
      subject: `Recordatorio: ${eventName}`,
      html: wrapEmailTemplate(
        "Recordatorio de Evento - Focus-Up",
        "Recordatorio de Evento",
        "#007bff",
        `
          <p>Hola, te recordamos que tienes un evento próximo:</p>
          <div class="box">
            <p><strong>${eventName}</strong></p>
            <p>Fecha: ${eventDate || "Por definir"}</p>
            <p>Hora: ${eventTime || "Por definir"}</p>
            <p>Descripción: ${eventDescription}</p>
            ${eventLink ? `<p class="cta"><a href="${eventLink}">Iniciar sesión de concentración</a></p>` : ""}
          </div>
          <div class="highlight">
            <p>No pierdas el ritmo. Planifica unos minutos antes para empezar con foco.</p>
          </div>
        `
      ),
    };
  }

  if (normalizedKind === "metodo_pendiente") {
    const methodName = asString(parsed?.nombreMetodo, "Método de estudio");
    const progress = asNumber(parsed?.progreso, 0);
    return {
      subject: "Recordatorio: Método de estudio pendiente",
      html: wrapEmailTemplate(
        "Recordatorio de Método de Estudio - Focus-Up",
        "Recordatorio de Método Pendiente",
        "#ffc107",
        `
          <p>Hola, tienes un método de estudio pendiente por continuar:</p>
          <div class="box" style="border-left-color:#ffc107;background:#fff8e1;">
            <p><strong>Método:</strong> ${methodName}</p>
            <p><strong>Progreso actual:</strong> ${progress}%</p>
          </div>
          <div class="highlight">
            <p>Un avance corto hoy mantiene el impulso. Continúa donde lo dejaste.</p>
          </div>
        `
      ),
    };
  }

  if (normalizedKind === "sesion_pendiente") {
    const sessionName = asString(parsed?.message, title || "Sesión de concentración");
    const sessionId = asNumber(parsed?.sessionId, 0);
    const baseEventsUrl = getFrontendEventsUrl();
    const sessionLink = sessionId > 0 ? `${baseEventsUrl}?sessionId=${sessionId}` : baseEventsUrl;
    return {
      subject: "Recordatorio: Sesión de concentración pendiente",
      html: wrapEmailTemplate(
        "Recordatorio de Sesión de Concentración - Focus-Up",
        "Recordatorio de Sesión Pendiente",
        "#28a745",
        `
          <p>Hola, tienes una sesión de concentración pendiente:</p>
          <div class="box" style="border-left-color:#28a745;background:#edf9f0;">
            <p><strong>${sessionName}</strong></p>
            <p class="cta"><a href="${sessionLink}">Ir a mis eventos/sesiones</a></p>
          </div>
          <div class="highlight">
            <p>Retoma tu sesión y suma otro bloque de progreso a tu objetivo.</p>
          </div>
        `
      ),
    };
  }

  if (normalizedKind === "motivation") {
    const currentWeek = getCurrentWeekNumber();
    const motivationalMessage = getWeeklyMotivationalMessage(currentWeek);
    return {
      subject: "Motivación semanal - Focus-Up",
      html: wrapEmailTemplate(
        "Motivación Semanal - Focus-Up",
        "Motivación Semanal",
        "#6f42c1",
        `
          <p>Hola, aquí tienes tu mensaje motivacional de la semana:</p>
          <div class="box" style="border-left-color:#6f42c1;background:#f4efff;">
            <p><strong>"${motivationalMessage}"</strong></p>
          </div>
          <div class="highlight">
            <p>Una semana a la vez, con enfoque constante y progreso real.</p>
          </div>
        `
      ),
    };
  }

  return {
    subject: title || "Notificación Focus-Up",
    html: wrapEmailTemplate(
      title || "Notificación Focus-Up",
      "Notificación",
      "#007bff",
      `<p>${message || "Tienes una notificación pendiente."}</p>`
    ),
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

export class PendingEmailScheduler {
  private readonly intervalMs: number;
  private readonly batchSize: number;
  private readonly enabled: boolean;
  private timer: ReturnType<typeof setTimeout> | null = null;
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

    const timer = setTimeout(() => {
      void this.tick();
    }, delayMs);
    this.timer = timer;
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
    const queryRunner = AppDataSource.createQueryRunner();
    let lockAcquired = false;

    try {
      await queryRunner.connect();
      const lockRows = await queryRunner.query("SELECT pg_try_advisory_lock($1) AS locked", [ADVISORY_LOCK_KEY]);
      lockAcquired = Boolean(lockRows?.[0]?.locked);
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
          await queryRunner.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_KEY]);
        } catch (unlockError) {
          logger.error("Email scheduler: error liberando lock global", { unlockError });
        }
      }

      try {
        await queryRunner.release();
      } catch (releaseError) {
        logger.error("Email scheduler: error liberando query runner", { releaseError });
      }
    }
  }
}

