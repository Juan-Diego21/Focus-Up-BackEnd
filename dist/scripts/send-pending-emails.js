#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron = __importStar(require("node-cron"));
const ormconfig_1 = require("../config/ormconfig");
const NotificacionesProgramadasRepository_1 = require("../repositories/NotificacionesProgramadasRepository");
const SessionService_1 = require("../services/SessionService");
const NotificationService_1 = require("../services/NotificationService");
const logger_1 = __importDefault(require("../utils/logger"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
async function sendEmail(to, subject, html) {
    try {
        const mailOptions = {
            from: `"Focus-Up" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`Email sent successfully to: ${to} - Subject: ${subject}`);
        return true;
    }
    catch (error) {
        logger_1.default.error(`Failed to send email to ${to}:`, error);
        return false;
    }
}
function generateEventEmailTemplate(eventName, eventDate, eventTime, eventDescription) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Evento</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .event-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
        .event-title { font-size: 20px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .event-info { margin: 5px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Focus-Up</div>
          <h2>🔔 Recordatorio de Evento</h2>
        </div>

        <p>Hola,</p>
        <p>Te recordamos que tienes un evento programado próximamente:</p>

        <div class="event-details">
          <div class="event-title">${eventName}</div>
          <div class="event-info"><strong>📅 Fecha:</strong> ${eventDate}</div>
          <div class="event-info"><strong>🕐 Hora:</strong> ${eventTime}</div>
          ${eventDescription ? `<div class="event-info"><strong>📝 Descripción:</strong> ${eventDescription}</div>` : ''}
        </div>

        <p>¡No olvides prepararte para este evento! Si necesitas ajustar tu horario de estudio, puedes hacerlo desde la aplicación.</p>

        <div class="footer">
          <p>Este es un mensaje automático de Focus-Up.</p>
          <p>&copy; 2024 Focus-Up. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateStudyMethodEmailTemplate(methodName, progress) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Método de Estudio</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .reminder-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .progress-bar { background-color: #e9ecef; border-radius: 10px; height: 20px; margin: 10px 0; }
        .progress-fill { background-color: #ffc107; height: 100%; border-radius: 10px; width: ${progress}%; }
        .progress-text { text-align: center; font-weight: bold; color: #856404; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Focus-Up</div>
          <h2>📚 Recordatorio de Método de Estudio</h2>
        </div>

        <p>Hola,</p>
        <p>Hace más de una semana que comenzaste con un método de estudio que aún no has completado:</p>

        <div class="reminder-box">
          <h3>🎯 Método: ${methodName}</h3>
          <p><strong>Progreso actual:</strong> ${progress}%</p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">${progress}% completado</div>
        </div>

        <p>¡Continúa con tu aprendizaje! La consistencia es clave para el éxito. Dedica un poco de tiempo hoy para avanzar en tus estudios.</p>

        <p>Recuerda: cada pequeño paso cuenta en tu camino hacia el conocimiento.</p>

        <div class="footer">
          <p>Este es un mensaje automático de Focus-Up.</p>
          <p>&copy; 2024 Focus-Up. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateSessionReminderEmailTemplate(sessionTitle) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Sesión de Concentración</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .reminder-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .session-title { font-size: 20px; font-weight: bold; color: #856404; margin-bottom: 10px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Focus-Up</div>
          <h2>🎯 Recordatorio de Sesión Pendiente</h2>
        </div>

        <p>Hola,</p>
        <p>Hace más de una semana que tienes una sesión de concentración pendiente:</p>

        <div class="reminder-box">
          <div class="session-title">📚 ${sessionTitle || 'Sesión de concentración'}</div>
          <p>Es hora de retomar tu sesión y continuar con tu progreso de estudio.</p>
        </div>

        <p>¡La consistencia es clave para el éxito! Dedica un tiempo hoy para avanzar en tus metas de estudio.</p>

        <p>Recuerda: cada sesión completada te acerca más a tus objetivos.</p>

        <div class="footer">
          <p>Este es un mensaje automático semanal de Focus-Up.</p>
          <p>&copy; 2024 Focus-Up. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateMotivationEmailTemplate(message) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Motivación Semanal</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .motivation-quote { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; font-size: 18px; font-style: italic; }
        .motivation-icon { font-size: 48px; margin-bottom: 15px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Focus-Up</div>
          <h2>🌟 Motivación Semanal</h2>
        </div>

        <p>Hola,</p>
        <p>¡Comienza esta semana con energía positiva! Aquí tienes tu mensaje motivacional semanal:</p>

        <div class="motivation-quote">
          <div class="motivation-icon">💪</div>
          <p><strong>"${message}"</strong></p>
        </div>

        <p>Recuerda que cada semana es una nueva oportunidad para crecer, aprender y alcanzar tus metas. ¡Tú tienes el poder de hacer que esta semana sea extraordinaria!</p>

        <p>¡Éxito en tus estudios y proyectos!</p>

        <div class="footer">
          <p>Este es un mensaje automático semanal de Focus-Up.</p>
          <p>&copy; 2024 Focus-Up. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function processSessionNotifications() {
    try {
        logger_1.default.info('🔄 Starting session notification processing...');
        const sessionService = new SessionService_1.SessionService();
        const notificationService = new NotificationService_1.NotificationService();
        const pendingSessions = await sessionService.getPendingSessionsOlderThan(7);
        if (pendingSessions.length === 0) {
            logger_1.default.info('✅ No pending sessions older than 7 days');
            return;
        }
        logger_1.default.info(`📧 Found ${pendingSessions.length} sessions pending > 7 days`);
        let notificationCount = 0;
        for (const session of pendingSessions) {
            try {
                const scheduledAt = new Date();
                scheduledAt.setHours(9, 0, 0, 0);
                await notificationService.createScheduledNotification({
                    userId: session.idUsuario,
                    sessionId: session.idSesion,
                    title: "Sesión de concentración pendiente",
                    message: `Tienes una sesión de concentración pendiente desde hace más de una semana. ¡Continúa con tu progreso!`,
                    scheduledAt,
                });
                notificationCount++;
                logger_1.default.info(`✅ Created notification for session ${session.idSesion}`);
            }
            catch (error) {
                logger_1.default.error(`❌ Error creating notification for session ${session.idSesion}:`, error);
            }
        }
        logger_1.default.info(`📊 Session notification processing completed: ${notificationCount} notifications created`);
    }
    catch (error) {
        logger_1.default.error('❌ Critical error in session notification processing:', error);
    }
}
async function processPendingEmails() {
    try {
        logger_1.default.info('🔄 Starting automated email processing...');
        const notifications = await (0, NotificacionesProgramadasRepository_1.getPendingNotifications)();
        logger_1.default.info(`📧 Found ${notifications.length} pending notifications to process`);
        if (notifications.length === 0) {
            logger_1.default.info('✅ No pending notifications to process');
            return;
        }
        let successCount = 0;
        let failureCount = 0;
        for (const notification of notifications) {
            try {
                logger_1.default.info(`📤 Processing notification ${notification.idNotificacion} (${notification.tipo}) for user ${notification.usuario?.correo}`);
                let emailSent = false;
                let subject = '';
                let html = '';
                switch (notification.tipo) {
                    case 'evento':
                        try {
                            const eventData = JSON.parse(notification.mensaje || '{}');
                            subject = `Recordatorio: ${eventData.nombreEvento || 'Evento'}`;
                            html = generateEventEmailTemplate(eventData.nombreEvento || 'Evento', eventData.fechaEvento || '', eventData.horaEvento || '', eventData.descripcionEvento);
                        }
                        catch (parseError) {
                            logger_1.default.warn(`Could not parse JSON for event notification ${notification.idNotificacion}, using plain text fallback`);
                            subject = notification.titulo || 'Recordatorio de Evento';
                            html = generateEventEmailTemplate('Evento', new Date().toISOString().split('T')[0], new Date().toTimeString().substring(0, 5), notification.mensaje || 'Tienes un evento programado');
                        }
                        break;
                    case 'metodo_pendiente':
                        try {
                            const methodData = JSON.parse(notification.mensaje || '{}');
                            subject = 'Recordatorio: Método de estudio pendiente';
                            html = generateStudyMethodEmailTemplate(methodData.nombreMetodo || 'Método de estudio', methodData.progreso || 0);
                        }
                        catch (parseError) {
                            logger_1.default.error(`Failed to parse method data for notification ${notification.idNotificacion}:`, parseError);
                            continue;
                        }
                        break;
                    case 'sesion_pendiente':
                        try {
                            const sessionData = JSON.parse(notification.mensaje || '{}');
                            subject = 'Recordatorio: Sesión de concentración pendiente';
                            html = generateSessionReminderEmailTemplate(sessionData.message || notification.titulo);
                        }
                        catch (parseError) {
                            logger_1.default.error(`Failed to parse session data for notification ${notification.idNotificacion}:`, parseError);
                            subject = 'Recordatorio: Sesión de concentración pendiente';
                            html = generateSessionReminderEmailTemplate(notification.titulo);
                        }
                        break;
                    case 'motivation':
                        subject = 'Motivación Semanal - Focus-Up';
                        html = generateMotivationEmailTemplate(notification.mensaje || '¡Sigue adelante con tus metas!');
                        break;
                    default:
                        logger_1.default.warn(`Unknown notification type: ${notification.tipo} for notification ${notification.idNotificacion}`);
                        continue;
                }
                if (notification.usuario?.correo) {
                    emailSent = await sendEmail(notification.usuario.correo, subject, html);
                }
                else {
                    logger_1.default.error(`No email address found for user in notification ${notification.idNotificacion}`);
                    continue;
                }
                if (emailSent) {
                    const markResult = await (0, NotificacionesProgramadasRepository_1.markAsSent)(notification.idNotificacion);
                    if (markResult) {
                        successCount++;
                        logger_1.default.info(`✅ Notification ${notification.idNotificacion} sent and marked as delivered`);
                    }
                    else {
                        logger_1.default.error(`❌ Failed to mark notification ${notification.idNotificacion} as sent`);
                        failureCount++;
                    }
                }
                else {
                    failureCount++;
                    logger_1.default.error(`❌ Failed to send email for notification ${notification.idNotificacion}`);
                }
            }
            catch (error) {
                logger_1.default.error(`❌ Error processing notification ${notification.idNotificacion}:`, error);
                failureCount++;
            }
        }
        logger_1.default.info(`📊 Email processing completed: ${successCount} successful, ${failureCount} failed`);
    }
    catch (error) {
        logger_1.default.error('❌ Critical error in email processing:', error);
    }
}
async function initialize() {
    try {
        await ormconfig_1.AppDataSource.initialize();
        logger_1.default.info('✅ Database connection established for email processor');
        await transporter.verify();
        logger_1.default.info('✅ Email transporter verified successfully');
        cron.schedule('* * * * *', processPendingEmails);
        logger_1.default.info('🚀 Automated email delivery system started - running every minute');
        cron.schedule('0 2 * * *', processSessionNotifications);
        logger_1.default.info('🚀 Session notification system started - running daily at 2 AM');
        await processPendingEmails();
        await processSessionNotifications();
    }
    catch (error) {
        logger_1.default.error('❌ Failed to initialize email delivery system:', error);
        process.exit(1);
    }
}
process.on('SIGINT', () => {
    logger_1.default.info('🛑 Shutting down email delivery system...');
    cron.getTasks().forEach(task => task.destroy());
    process.exit(0);
});
process.on('SIGTERM', () => {
    logger_1.default.info('🛑 Shutting down email delivery system...');
    cron.getTasks().forEach(task => task.destroy());
    process.exit(0);
});
initialize().catch((error) => {
    logger_1.default.error('❌ Failed to start email delivery system:', error);
    process.exit(1);
});
