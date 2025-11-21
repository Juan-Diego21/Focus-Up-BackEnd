#!/usr/bin/env ts-node

/**
 * Automated Email Delivery System for Scheduled Notifications
 *
 * This script runs on a cron schedule to automatically send pending email notifications
 * stored in the database. It processes all types of notifications:
 * - Event reminders (10 minutes before or at event time)
 * - Incomplete study method reminders (after 7 days)
 * - Weekly motivational messages
 *
 * The script:
 * 1. Connects to the database
 * 2. Fetches pending notifications
 * 3. Sends emails using NodeMailer
 * 4. Marks notifications as sent
 * 5. Runs every minute via cron
 */

import * as cron from 'node-cron';
import { AppDataSource } from '../config/ormconfig';
import { getPendingNotifications, markAsSent } from '../repositories/NotificacionesProgramadasRepository';
import { getWeeklyMotivationalMessage } from '../config/motivationalMessages';
import { SessionService } from '../services/SessionService';
import { NotificationService } from '../services/NotificationService';
import logger from '../utils/logger';
import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Sends an email notification
 */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Focus-Up" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to: ${to} - Subject: ${subject}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

/**
 * Generates HTML email template for event notifications
 */
function generateEventEmailTemplate(eventName: string, eventDate: string, eventTime: string, eventDescription?: string): string {
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

/**
 * Generates HTML email template for study method reminders
 */
function generateStudyMethodEmailTemplate(methodName: string, progress: number): string {
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

/**
 * Generates HTML email template for session reminders
 */
function generateSessionReminderEmailTemplate(sessionTitle?: string): string {
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

/**
 * Generates HTML email template for weekly motivation
 */
function generateMotivationEmailTemplate(message: string): string {
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

/**
 * Processes session notifications: finds pending sessions > 7 days and creates notifications
 */
async function processSessionNotifications(): Promise<void> {
  try {
    logger.info('🔄 Starting session notification processing...');

    const sessionService = new SessionService();
    const notificationService = new NotificationService();

    // Get sessions pending more than 7 days
    const pendingSessions = await sessionService.getPendingSessionsOlderThan(7);

    if (pendingSessions.length === 0) {
      logger.info('✅ No pending sessions older than 7 days');
      return;
    }

    logger.info(`📧 Found ${pendingSessions.length} sessions pending > 7 days`);

    let notificationCount = 0;

    for (const session of pendingSessions) {
      try {
        // Create notification for the session
        const scheduledAt = new Date();
        scheduledAt.setHours(9, 0, 0, 0); // Schedule for 9 AM

        await notificationService.createScheduledNotification({
          userId: session.idUsuario,
          sessionId: session.idSesion,
          title: "Sesión de concentración pendiente",
          message: `Tienes una sesión de concentración pendiente desde hace más de una semana. ¡Continúa con tu progreso!`,
          scheduledAt,
        });

        notificationCount++;
        logger.info(`✅ Created notification for session ${session.idSesion}`);
      } catch (error) {
        logger.error(`❌ Error creating notification for session ${session.idSesion}:`, error);
      }
    }

    logger.info(`📊 Session notification processing completed: ${notificationCount} notifications created`);

  } catch (error) {
    logger.error('❌ Critical error in session notification processing:', error);
  }
}

/**
 * Processes all pending notifications and sends emails
 */
async function processPendingEmails(): Promise<void> {
  try {
    logger.info('🔄 Starting automated email processing...');

    // Get all pending notifications
    const notifications = await getPendingNotifications();
    logger.info(`📧 Found ${notifications.length} pending notifications to process`);

    if (notifications.length === 0) {
      logger.info('✅ No pending notifications to process');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each notification
    for (const notification of notifications) {
      try {
        logger.info(`📤 Processing notification ${notification.idNotificacion} (${notification.tipo}) for user ${notification.usuario?.correo}`);

        let emailSent = false;
        let subject = '';
        let html = '';

        // Generate email content based on notification type
        switch (notification.tipo) {
          case 'evento':
            // Event notification - try to parse as JSON, fallback to plain text
            try {
              const eventData = JSON.parse(notification.mensaje || '{}');
              subject = `Recordatorio: ${eventData.nombreEvento || 'Evento'}`;
              html = generateEventEmailTemplate(
                eventData.nombreEvento || 'Evento',
                eventData.fechaEvento || '',
                eventData.horaEvento || '',
                eventData.descripcionEvento
              );
            } catch (parseError) {
              // Fallback: treat as plain text message
              logger.warn(`Could not parse JSON for event notification ${notification.idNotificacion}, using plain text fallback`);
              subject = notification.titulo || 'Recordatorio de Evento';
              html = generateEventEmailTemplate(
                'Evento',
                new Date().toISOString().split('T')[0], // Today's date as fallback
                new Date().toTimeString().substring(0, 5), // Current time as fallback
                notification.mensaje || 'Tienes un evento programado'
              );
            }
            break;

          case 'metodo_pendiente':
            // Study method reminder
            try {
              const methodData = JSON.parse(notification.mensaje || '{}');
              subject = 'Recordatorio: Método de estudio pendiente';
              html = generateStudyMethodEmailTemplate(
                methodData.nombreMetodo || 'Método de estudio',
                methodData.progreso || 0
              );
            } catch (parseError) {
              logger.error(`Failed to parse method data for notification ${notification.idNotificacion}:`, parseError);
              continue;
            }
            break;

          case 'sesion_pendiente':
            // Session reminder
            try {
              const sessionData = JSON.parse(notification.mensaje || '{}');
              subject = 'Recordatorio: Sesión de concentración pendiente';
              html = generateSessionReminderEmailTemplate(sessionData.message || notification.titulo);
            } catch (parseError) {
              logger.error(`Failed to parse session data for notification ${notification.idNotificacion}:`, parseError);
              subject = 'Recordatorio: Sesión de concentración pendiente';
              html = generateSessionReminderEmailTemplate(notification.titulo);
            }
            break;

          case 'motivation':
            // Weekly motivation - mensaje contains the motivational text
            subject = 'Motivación Semanal - Focus-Up';
            html = generateMotivationEmailTemplate(notification.mensaje || '¡Sigue adelante con tus metas!');
            break;

          default:
            logger.warn(`Unknown notification type: ${notification.tipo} for notification ${notification.idNotificacion}`);
            continue;
        }

        // Send the email
        if (notification.usuario?.correo) {
          emailSent = await sendEmail(notification.usuario.correo, subject, html);
        } else {
          logger.error(`No email address found for user in notification ${notification.idNotificacion}`);
          continue;
        }

        if (emailSent) {
          // Mark as sent
          const markResult = await markAsSent(notification.idNotificacion);
          if (markResult) {
            successCount++;
            logger.info(`✅ Notification ${notification.idNotificacion} sent and marked as delivered`);
          } else {
            logger.error(`❌ Failed to mark notification ${notification.idNotificacion} as sent`);
            failureCount++;
          }
        } else {
          failureCount++;
          logger.error(`❌ Failed to send email for notification ${notification.idNotificacion}`);
        }

      } catch (error) {
        logger.error(`❌ Error processing notification ${notification.idNotificacion}:`, error);
        failureCount++;
      }
    }

    logger.info(`📊 Email processing completed: ${successCount} successful, ${failureCount} failed`);

  } catch (error) {
    logger.error('❌ Critical error in email processing:', error);
  }
}

/**
 * Initialize the database connection and start the cron job
 */
async function initialize(): Promise<void> {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('✅ Database connection established for email processor');

    // Test email configuration
    await transporter.verify();
    logger.info('✅ Email transporter verified successfully');

    // Start cron job - runs every minute for email sending
    cron.schedule('* * * * *', processPendingEmails);
    logger.info('🚀 Automated email delivery system started - running every minute');

    // Start daily cron job for session notifications - runs daily at 2 AM
    cron.schedule('0 2 * * *', processSessionNotifications);
    logger.info('🚀 Session notification system started - running daily at 2 AM');

    // Run initial checks
    await processPendingEmails();
    await processSessionNotifications();

  } catch (error) {
    logger.error('❌ Failed to initialize email delivery system:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down email delivery system...');
  cron.getTasks().forEach(task => task.destroy());
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Shutting down email delivery system...');
  cron.getTasks().forEach(task => task.destroy());
  process.exit(0);
});

// Start the system
initialize().catch((error) => {
  logger.error('❌ Failed to start email delivery system:', error);
  process.exit(1);
});