import nodemailer from "nodemailer";
import { AppDataSource } from "../config/ormconfig";
import {
  getWeeklyMotivationalMessage,
  getCurrentWeekNumber,
} from "../config/motivationalMessages";
import {
  getPendingNotifications,
  markAsSent,
} from "../repositories/NotificacionesProgramadasRepository";
import { MetodoRealizadoEntity } from "../models/MetodoRealizado.entity";
import logger from "../utils/logger";

type NotificationKind =
  | "evento"
  | "metodo_pendiente"
  | "sesion_pendiente"
  | "motivation"
  | string;

interface EmailPayload {
  subject: string;
  html: string;
}

interface PendingEmailProcessorOptions {
  batchSize?: number;
  advisoryLockKey?: number;
}

interface MethodReminderSnapshot {
  methodName: string;
  progress: number;
  accentColor: string;
  reportsUrl: string;
}

export interface PendingEmailProcessorResult {
  lockAcquired: boolean;
  pendingDetected: number;
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_ADVISORY_LOCK_KEY = 8_775_311;

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

const isTestRecipient = (email: string): boolean => {
  return email === "john@example.com" || email === "test@example.com";
};

const parseMessageAsJson = (
  message?: string
): Record<string, unknown> | null => {
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
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
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

const getFrontendReportsUrl = (): string => {
  return `${getFrontendBaseUrl()}/reports`;
};

const getStartSessionUrl = (eventId: number): string => {
  return `${getFrontendBaseUrl()}/start-session?eventId=${eventId}`;
};

// Mapa de colores para correos de recordatorio de métodos.
const METHOD_REMINDER_COLORS: Record<string, string> = {
  "metodo pomodoro": "#E53935",
  "pomodoro": "#E53935",
  "mapas mentales": "#10B981",
  "repaso espaciado": "#7E57C2",
  "practica activa": "#43A047",
  "metodo feynman": "#FFD54F",
  "feynman": "#FFD54F",
  "metodo cornell": "#3B82F6",
  "cornell": "#3B82F6",
};

const DEFAULT_METHOD_REMINDER_COLOR = "#FFC107";

const normalizeTextForLookup = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getMethodReminderColor = (methodName: string): string => {
  const normalized = normalizeTextForLookup(methodName);
  return METHOD_REMINDER_COLORS[normalized] || DEFAULT_METHOD_REMINDER_COLOR;
};

const clampProgress = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
};

const extractMethodNameFromLegacyMessage = (message?: string): string => {
  if (!message) return "";
  const normalizedMessage = normalizeTextForLookup(message);
  const marker = "metodo sin finalizar:";
  const markerIndex = normalizedMessage.indexOf(marker);
  if (markerIndex < 0) return "";

  const extracted = normalizedMessage.slice(markerIndex + marker.length).trim();
  if (!extracted) return "";

  return extracted.split(".")[0]?.trim() || "";
};

/**
 * Obtiene el estado real del método recordado.
 * Si existe `idMetodoRealizado`, consulta BD para evitar usar progreso stale.
 * Si no existe, usa el payload recibido como fallback.
 */
const resolveMethodReminderSnapshot = async (
  parsed: Record<string, unknown> | null,
  rawMessage: string | undefined,
  userId: number
): Promise<MethodReminderSnapshot> => {
  const parsedMethodName = asString(parsed?.nombreMetodo, "");
  const parsedProgress = clampProgress(asNumber(parsed?.progreso, 0));
  const methodReportId = readNumericId(
    parsed?.idMetodoRealizado ?? parsed?.id_metodo_realizado
  );

  let resolvedName = parsedMethodName;
  let resolvedProgress = parsedProgress;

  try {
    const methodRepository = AppDataSource.getRepository(MetodoRealizadoEntity);

    // Caso preferido: notificación apunta al método exacto por id.
    if (methodReportId > 0) {
      const method = await methodRepository
        .createQueryBuilder("mr")
        .leftJoinAndSelect("mr.metodo", "metodo")
        .where("mr.idMetodoRealizado = :methodReportId", { methodReportId })
        .andWhere("mr.idUsuario = :userId", { userId })
        .getOne();

      if (method) {
        resolvedName = method.metodo?.nombreMetodo || resolvedName;
        resolvedProgress = clampProgress(Number(method.progreso));
      }
    } else if (userId > 0) {
      // Fallback para payloads legacy sin id: toma el último método incompleto.
      const latestIncompleteMethod = await methodRepository
        .createQueryBuilder("mr")
        .leftJoinAndSelect("mr.metodo", "metodo")
        .where("mr.idUsuario = :userId", { userId })
        .andWhere("mr.progreso < :completed", { completed: 100 })
        .orderBy("mr.fechaActualizacion", "DESC")
        .addOrderBy("mr.fechaCreacion", "DESC")
        .getOne();

      if (latestIncompleteMethod) {
        resolvedName = latestIncompleteMethod.metodo?.nombreMetodo || resolvedName;
        resolvedProgress = clampProgress(Number(latestIncompleteMethod.progreso));
      }
    }
  } catch (error) {
    logger.warn(
      "Email scheduler: no se pudo resolver estado real de método desde BD",
      {
        methodReportId,
        userId,
        error,
      }
    );
  }

  if (!resolvedName) {
    resolvedName =
      extractMethodNameFromLegacyMessage(rawMessage) || "Método de estudio";
  }

  return {
    methodName: resolvedName,
    progress: resolvedProgress,
    accentColor: getMethodReminderColor(resolvedName),
    reportsUrl: getFrontendReportsUrl(),
  };
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

const getEventDescription = (
  parsed: Record<string, unknown> | null
): string => {
  const description = asString(parsed?.descripcionEvento, "");
  return description || "Sin descripción";
};

const normalizeKind = (kind: NotificationKind): NotificationKind => {
  if (kind === "motivacion") return "motivation";
  return kind;
};

const wrapEmailTemplate = (
  title: string,
  subtitle: string,
  accentColor: string,
  content: string
): string => {
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
          <p>Este es un mensaje automático de Focus-Up.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const buildEmailPayload = async (
  kind: NotificationKind,
  title?: string,
  message?: string,
  userId = 0
): Promise<EmailPayload> => {
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
    const isConcentrationEvent =
      eventType === "concentracion" || rawEventLink.includes("/start-session");
    const eventLink =
      eventId > 0 && isConcentrationEvent
        ? getStartSessionUrl(eventId)
        : normalizeStartSessionLink(rawEventLink);

    return {
      subject: `Recordatorio: ${eventName}`,
      html: wrapEmailTemplate(
        "Recordatorio de Evento - Focus-Up",
        "Recordatorio de Evento",
        "#007bff",
        `
          <p>Hola, te recordamos que tienes un evento proximo:</p>
          <div class="box">
            <p><strong>${eventName}</strong></p>
            <p>Fecha: ${eventDate || "Por definir"}</p>
            <p>Hora: ${eventTime || "Por definir"}</p>
            <p>Descripcion: ${eventDescription}</p>
            ${eventLink ? `<p class="cta"><a href="${eventLink}">Iniciar sesion de concentracion</a></p>` : ""}
          </div>
          <div class="highlight">
            <p>No pierdas el ritmo. Planifica unos minutos antes para empezar con foco.</p>
          </div>
        `
      ),
    };
  }

  if (normalizedKind === "metodo_pendiente") {
    const methodSnapshot = await resolveMethodReminderSnapshot(parsed, message, userId);

    return {
      subject: "Recordatorio: Metodo de estudio pendiente",
      html: wrapEmailTemplate(
        "Recordatorio de Metodo de Estudio - Focus-Up",
        "Recordatorio de Metodo Pendiente",
        methodSnapshot.accentColor,
        `
          <p>Hola, tienes un metodo de estudio pendiente por continuar:</p>
          <div class="box">
            <p><strong>Metodo:</strong> ${methodSnapshot.methodName}</p>
            <p><strong>Progreso actual:</strong> ${methodSnapshot.progress}%</p>
            <p class="cta"><a href="${methodSnapshot.reportsUrl}">Ver metodo de estudio pendiente</a></p>
          </div>
          <div class="highlight">
            <p>Un avance corto hoy mantiene el impulso. Continua donde lo dejaste.</p>
          </div>
        `
      ),
    };
  }

  if (normalizedKind === "sesion_pendiente") {
    const sessionName = asString(parsed?.message, title || "Sesion de concentracion");
    const sessionId = asNumber(parsed?.sessionId, 0);
    const baseEventsUrl = getFrontendEventsUrl();
    const sessionLink =
      sessionId > 0 ? `${baseEventsUrl}?sessionId=${sessionId}` : baseEventsUrl;
    return {
      subject: "Recordatorio: Sesion de concentracion pendiente",
      html: wrapEmailTemplate(
        "Recordatorio de Sesion de Concentracion - Focus-Up",
        "Recordatorio de Sesion Pendiente",
        "#28a745",
        `
          <p>Hola, tienes una sesion de concentracion pendiente:</p>
          <div class="box" style="border-left-color:#28a745;background:#edf9f0;">
            <p><strong>${sessionName}</strong></p>
            <p class="cta"><a href="${sessionLink}">Ir a mis eventos/sesiones</a></p>
          </div>
          <div class="highlight">
            <p>Retoma tu sesion y suma otro bloque de progreso a tu objetivo.</p>
          </div>
        `
      ),
    };
  }

  if (normalizedKind === "motivation") {
    const currentWeek = getCurrentWeekNumber();
    const motivationalMessage = getWeeklyMotivationalMessage(currentWeek);
    return {
      subject: "Motivacion semanal - Focus-Up",
      html: wrapEmailTemplate(
        "Motivacion Semanal - Focus-Up",
        "Motivacion Semanal",
        "#6f42c1",
        `
          <p>Hola, aqui tienes tu mensaje motivacional de la semana:</p>
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
    subject: title || "Notificacion Focus-Up",
    html: wrapEmailTemplate(
      title || "Notificacion Focus-Up",
      "Notificacion",
      "#007bff",
      `<p>${message || "Tienes una notificacion pendiente."}</p>`
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

/**
 * Procesa una tanda de notificaciones pendientes y las marca como enviadas.
 * Este método ejecuta un único ciclo y está pensado para invocación externa
 * (por ejemplo, desde un script ejecutado por GitHub Actions).
 */
export const processPendingEmailNotifications = async (
  options: PendingEmailProcessorOptions = {}
): Promise<PendingEmailProcessorResult> => {
  if (!AppDataSource.isInitialized) {
    throw new Error(
      "AppDataSource no está inicializado. Debes abrir la conexión a BD antes de procesar correos."
    );
  }

  const batchSize = options.batchSize ?? parseInteger(
    process.env.EMAIL_SCHEDULER_BATCH_SIZE,
    DEFAULT_BATCH_SIZE
  );
  const advisoryLockKey = options.advisoryLockKey ?? DEFAULT_ADVISORY_LOCK_KEY;

  // Validamos credenciales SMTP antes de comenzar para evitar reintentos vacíos.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn(
      "Email scheduler: envío omitido porque faltan EMAIL_USER/EMAIL_PASS"
    );
    return {
      lockAcquired: false,
      pendingDetected: 0,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };
  }

  const queryRunner = AppDataSource.createQueryRunner();
  let lockAcquired = false;

  try {
    await queryRunner.connect();

    // Lock global para evitar doble ejecución cuando dos runners coinciden.
    const lockRows = await queryRunner.query(
      "SELECT pg_try_advisory_lock($1) AS locked",
      [advisoryLockKey]
    );
    lockAcquired = Boolean(lockRows?.[0]?.locked);
    if (!lockAcquired) {
      logger.info(
        "Email scheduler: lock global no adquirido, se omite este ciclo"
      );
      return {
        lockAcquired: false,
        pendingDetected: 0,
        processed: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
      };
    }

    // Leemos pendientes en orden cronológico y procesamos sólo el batch configurado.
    const allPending = await getPendingNotifications();
    const pending = allPending.slice(0, batchSize);

    if (pending.length === 0) {
      logger.info("Email scheduler: no hay notificaciones pendientes por enviar");
      return {
        lockAcquired: true,
        pendingDetected: 0,
        processed: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
      };
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const notification of pending) {
      const to = notification.usuario?.correo;
      if (!to) {
        failed++;
        logger.error("Email scheduler: notificación sin correo de usuario", {
          idNotificacion: notification.idNotificacion,
          idUsuario: notification.idUsuario,
        });
        continue;
      }

      const payload = await buildEmailPayload(
        notification.tipo,
        notification.titulo,
        notification.mensaje,
        notification.idUsuario
      );
      const delivered = await sendEmail(to, payload);

      if (!delivered) {
        failed++;
        continue;
      }

      // Sólo marcamos como enviada si el transporte reporta éxito.
      const marked = await markAsSent(notification.idNotificacion);
      if (!marked) {
        failed++;
        logger.error(
          "Email scheduler: no se pudo marcar notificación como enviada",
          { idNotificacion: notification.idNotificacion }
        );
        continue;
      }

      if (isTestRecipient(to)) {
        skipped++;
      } else {
        sent++;
      }
    }

    const result: PendingEmailProcessorResult = {
      lockAcquired: true,
      pendingDetected: allPending.length,
      processed: pending.length,
      sent,
      failed,
      skipped,
    };

    logger.info("Email scheduler: ciclo completado", result);
    return result;
  } finally {
    if (lockAcquired) {
      try {
        await queryRunner.query("SELECT pg_advisory_unlock($1)", [advisoryLockKey]);
      } catch (unlockError) {
        logger.error("Email scheduler: error liberando lock global", {
          unlockError,
        });
      }
    }

    try {
      await queryRunner.release();
    } catch (releaseError) {
      logger.error("Email scheduler: error liberando query runner", {
        releaseError,
      });
    }
  }
};
