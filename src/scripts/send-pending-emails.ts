#!/usr/bin/env ts-node

/**
 * Sistema Automatizado de Entrega de Correos Electrónicos para Notificaciones Programadas
 *
 * Este script se ejecuta en un horario cron para enviar automáticamente notificaciones
 * de correo electrónico pendientes almacenadas en la base de datos. Procesa todos los
 * tipos de notificaciones y programa nuevas notificaciones automáticamente:
 *
 * TIPOS DE NOTIFICACIONES PROCESADAS:
 * - Recordatorios de eventos (10 minutos antes o a la hora del evento)
 * - Recordatorios de métodos de estudio incompletos (después de 7 días)
 * - Recordatorios de sesiones pendientes (después de 7 días)
 * - Mensajes motivacionales semanales (cada domingo)
 *
 * CRON JOBS AUTOMÁTICOS:
 * - Procesamiento de emails: cada 10 segundos
 * - Creación de notificaciones de sesiones: diariamente a las 2 AM
 * - Limpieza de códigos expirados: diariamente a las 3 AM
 * - Programación de emails motivacionales: cada domingo a las 9 AM
 *
 * El script realiza los siguientes pasos:
 * 1. Se conecta a la base de datos
 * 2. Obtiene las notificaciones pendientes
 * 3. Envía correos electrónicos usando NodeMailer
 * 4. Marca las notificaciones como enviadas
 * 5. Programa nuevas notificaciones automáticamente
 */

import * as cron from 'node-cron';
import { AppDataSource } from '../config/ormconfig';
import { getPendingNotifications, markAsSent } from '../repositories/NotificacionesProgramadasRepository';
import { SessionService } from '../services/SessionService';
import { NotificationService } from '../services/NotificationService';
import { EmailVerificationService } from '../services/EmailVerificationService';
import { NotificacionesProgramadasService } from '../services/NotificacionesProgramadasService';
import { getWeeklyMotivationalMessage, getCurrentWeekNumber } from '../config/motivationalMessages';
import logger from '../utils/logger';
import nodemailer from 'nodemailer';

// Configuración del transportador de correo electrónico para notificaciones
// Utiliza las mismas credenciales SMTP que el módulo principal de correos
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Servidor SMTP configurado
  port: Number.parseInt(process.env.SMTP_PORT || "587"), // Puerto SMTP (587 para TLS)
  secure: process.env.SMTP_SECURE === "true", // Conexión segura para puerto 465
  auth: {
    user: process.env.EMAIL_USER!, // Usuario de correo electrónico
    pass: process.env.EMAIL_PASS!, // Contraseña de aplicación
  },
  tls: {
    rejectUnauthorized: false, // Permite certificados autofirmados en desarrollo
  },
});

/**
 * Envía una notificación por correo electrónico
 *
 * @param to - Dirección de correo electrónico del destinatario
 * @param subject - Asunto del correo electrónico
 * @param html - Contenido HTML del correo electrónico
 * @returns true si el envío fue exitoso, false en caso contrario
 */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    // Omitir envío a direcciones de prueba para evitar spam en desarrollo
    if (to === 'john@example.com' || to === 'test@example.com') {
      logger.info(`Omitiendo envío a dirección de prueba: ${to}`);
      return true; // Retornar true para marcar como "enviado" sin enviar realmente
    }

    // Configuración del correo electrónico
    const mailOptions = {
      from: `"Focus-Up" <${process.env.EMAIL_USER}>`, // Remitente personalizado
      to, // Destinatario
      subject, // Asunto del correo
      html, // Contenido HTML con plantilla
    };

    // Enviar el correo electrónico usando el transportador configurado
    await transporter.sendMail(mailOptions);

    // Registrar envío exitoso
    logger.info(`Correo enviado exitosamente a: ${to} - Asunto: ${subject}`);
    return true;
  } catch (error) {
    // Registrar error en el envío
    logger.error(`Error al enviar correo a ${to}:`, error);
    return false;
  }
}

/**
 * Genera plantilla HTML de correo electrónico para recordatorios de eventos
 *
 * Crea una plantilla con diseño moderno que incluye el logo de Focus-Up
 * y colores consistentes con la aplicación. La plantilla muestra información
 * del evento de manera clara y atractiva.
 *
 * @param eventName - Nombre del evento programado
 * @param eventDate - Fecha del evento (formato legible)
 * @param eventTime - Hora del evento (formato legible)
 * @param eventDescription - Descripción opcional del evento
 * @returns Cadena HTML con la plantilla completa del correo
 */
function generateEventEmailTemplate(eventName: string, eventDate: string, eventTime: string, eventDescription?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Evento - Focus-Up</title>
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
          border-bottom: 2px solid #007bff;
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
        .event-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #007bff;
        }
        .event-title {
          font-size: 18px;
          font-weight: 600;
          color: #007bff;
          margin-bottom: 15px;
        }
        .event-info {
          margin: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .event-info strong {
          color: #495057;
          min-width: 60px;
          font-weight: 600;
        }
        .icon {
          font-size: 16px;
          color: #007bff;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
        .highlight {
          background-color: #e7f3ff;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 1px solid #b3d7ff;
        }
        .highlight p {
          margin: 0;
          color: #0056b3;
          font-weight: 500;
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
          <p class="subtitle">🔔 Recordatorio de Evento</p>
        </div>

        <div class="content">
          <p>Hola,</p>
          <p>Te recordamos que tienes un evento programado próximamente:</p>

          <div class="event-details">
            <div class="event-title">${eventName}</div>
            <div class="event-info">
              <span class="icon">📅</span>
              <strong>Fecha:</strong> <span>${eventDate}</span>
            </div>
            <div class="event-info">
              <span class="icon">🕐</span>
              <strong>Hora:</strong> <span>${eventTime}</span>
            </div>
            ${eventDescription ? `<div class="event-info">
              <span class="icon">📝</span>
              <strong>Descripción:</strong> <span>${eventDescription}</span>
            </div>` : ''}
          </div>

          <div class="highlight">
            <p>¡No olvides prepararte para este evento! Si necesitas ajustar tu horario de estudio, puedes hacerlo desde la aplicación.</p>
          </div>
        </div>

        <div class="footer">
          <p>Este es un mensaje automático de Focus-Up.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera plantilla HTML de correo electrónico para recordatorios de métodos de estudio
 *
 * Crea una plantilla motivacional que muestra el progreso del usuario en un método
 * de estudio específico. Incluye una barra de progreso visual y mensajes de
 * motivación para continuar con el aprendizaje.
 *
 * @param methodName - Nombre del método de estudio (ej: "Método Pomodoro")
 * @param progress - Porcentaje de progreso completado (0-100)
 * @returns Cadena HTML con la plantilla completa del correo
 */
function generateStudyMethodEmailTemplate(methodName: string, progress: number): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Método de Estudio - Focus-Up</title>
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
          border-bottom: 2px solid #ffc107;
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
        .reminder-box {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .reminder-box h3 {
          color: #856404;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .progress-container {
          margin: 20px 0;
        }
        .progress-bar {
          background-color: #e9ecef;
          border-radius: 10px;
          height: 20px;
          margin: 10px 0;
          overflow: hidden;
        }
        .progress-fill {
          background: linear-gradient(90deg, #ffc107 0%, #fd7e14 100%);
          height: 100%;
          border-radius: 10px;
          width: ${progress}%;
          transition: width 0.3s ease;
        }
        .progress-text {
          text-align: center;
          font-weight: 600;
          color: #856404;
          font-size: 14px;
        }
        .highlight {
          background-color: #d1ecf1;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 1px solid #bee5eb;
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
          <p class="subtitle">📚 Recordatorio de Método de Estudio</p>
        </div>

        <div class="content">
          <p>Hola,</p>
          <p>Hace más de una semana que comenzaste con un método de estudio que aún no has completado:</p>

          <div class="reminder-box">
            <h3>🎯 Método: ${methodName}</h3>
            <p><strong>Progreso actual:</strong> <span style="color: #0056b3; font-weight: 600;">${progress}%</span></p>
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <div class="progress-text">${progress}% completado</div>
            </div>
          </div>

          <div class="highlight">
            <p>¡Continúa con tu aprendizaje! La consistencia es clave para el éxito. Dedica un poco de tiempo hoy para avanzar en tus estudios.</p>
          </div>

          <div class="highlight">
            <p>Recuerda: cada pequeño paso cuenta en tu camino hacia el conocimiento.</p>
          </div>
        </div>

        <div class="footer">
          <p>Este es un mensaje automático de Focus-Up.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera plantilla HTML de correo electrónico para recordatorios de sesiones
 *
 * Crea una plantilla que motiva al usuario a retomar sesiones de concentración
 * pendientes. Enfatiza la importancia de la consistencia en el estudio.
 *
 * @param sessionTitle - Título opcional de la sesión pendiente
 * @returns Cadena HTML con la plantilla completa del correo
 */
function generateSessionReminderEmailTemplate(sessionTitle?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Sesión de Concentración - Focus-Up</title>
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
          border-bottom: 2px solid #28a745;
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
        .reminder-box {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: center;
        }
        .session-title {
          font-size: 18px;
          font-weight: 600;
          color: #155724;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .reminder-box p {
          color: #155724;
          margin: 8px 0;
          font-weight: 500;
        }
        .highlight {
          background-color: #d1ecf1;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 1px solid #bee5eb;
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
          <p class="subtitle">🎯 Recordatorio de Sesión Pendiente</p>
        </div>

        <div class="content">
          <p>Hola,</p>
          <p>Hace más de una semana que tienes una sesión de concentración pendiente:</p>

          <div class="reminder-box">
            <div class="session-title">📚 ${sessionTitle || 'Sesión de concentración'}</div>
            <p>Es hora de retomar tu sesión y continuar con tu progreso de estudio.</p>
          </div>

          <div class="highlight">
            <p>¡La consistencia es clave para el éxito! Dedica un tiempo hoy para avanzar en tus metas de estudio.</p>
          </div>

          <div class="highlight">
            <p>Recuerda: cada sesión completada te acerca más a tus objetivos.</p>
          </div>
        </div>

        <div class="footer">
          <p>Este es un mensaje automático semanal de Focus-Up.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera plantilla HTML de correo electrónico para motivación semanal
 *
 * Crea una plantilla inspiracional con mensajes motivacionales semanales.
 * Utiliza colores cálidos y diseño atractivo para transmitir positividad
 * y motivación a los usuarios.
 *
 * @param message - Mensaje motivacional a incluir en el correo
 * @returns Cadena HTML con la plantilla completa del correo
 */
function generateMotivationEmailTemplate(message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Motivación Semanal - Focus-Up</title>
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
          border-bottom: 2px solid #6f42c1;
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
        .motivation-quote {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #333333;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin: 25px 0;
          border: 2px solid #dee2e6;
          position: relative;
        }
        .motivation-icon {
          font-size: 36px;
          margin-bottom: 15px;
          display: block;
        }
        .motivation-quote blockquote {
          font-size: 18px;
          font-style: italic;
          color: #495057;
          margin: 0;
          padding: 0;
          border: none;
          quotes: none;
        }
        .motivation-quote blockquote:before,
        .motivation-quote blockquote:after {
          content: none;
        }
        .highlight {
          background-color: #f8d7da;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 1px solid #f5c6cb;
        }
        .highlight p {
          margin: 0;
          color: #721c24;
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
          .motivation-quote {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-text">Focus-Up</h1>
          <p class="subtitle">🌟 Motivación Semanal</p>
        </div>

        <div class="content">
          <p>Hola,</p>
          <p>¡Comienza esta semana con energía positiva! Aquí tienes tu mensaje motivacional semanal:</p>

          <div class="motivation-quote">
            <span class="motivation-icon">💪</span>
            <blockquote>"${message}"</blockquote>
          </div>

          <div class="highlight">
            <p>Recuerda que cada semana es una nueva oportunidad para crecer, aprender y alcanzar tus metas. ¡Tú tienes el poder de hacer que esta semana sea extraordinaria!</p>
          </div>

          <div class="highlight">
            <p>¡Éxito en tus estudios y proyectos!</p>
          </div>
        </div>

        <div class="footer">
          <p>Este es un mensaje automático semanal de Focus-Up.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Procesa notificaciones de sesiones: encuentra sesiones pendientes > 7 días y crea notificaciones
 *
 * Esta función se ejecuta diariamente para identificar sesiones de concentración
 * que han estado pendientes por más de una semana. Crea notificaciones automáticas
 * para motivar a los usuarios a retomar sus sesiones.
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
 * Limpia códigos de verificación expirados de la base de datos
 *
 * Esta función elimina automáticamente los códigos de verificación que han
 * expirado para mantener la base de datos limpia y prevenir acumulación
 * de datos innecesarios.
 */
async function cleanupExpiredVerificationCodes(): Promise<void> {
  try {
    logger.info('🧹 Starting cleanup of expired verification codes...');

    const emailVerificationService = new EmailVerificationService();
    const deletedCount = await emailVerificationService.cleanupExpiredCodes();

    logger.info(`🧹 Cleanup completed: ${deletedCount} expired verification codes removed`);

  } catch (error) {
    logger.error('❌ Error during verification codes cleanup:', error);
  }
}

/**
 * Programa emails motivacionales semanales para todos los usuarios suscritos
 *
 * Esta función se ejecuta semanalmente para crear notificaciones motivacionales
 * para todos los usuarios que tienen habilitadas las notificaciones de motivación.
 * Cada semana rota el mensaje motivacional basado en el número de semana del año.
 *
 * Reglas de negocio:
 * - Solo usuarios con notificaciones.motivacion = true
 * - Un email por semana, programado para envio inmediato tras ejecutar el cron
 * - Mensaje rotativo semanal basado en el número de semana (0-51)
 */
async function scheduleWeeklyMotivationalEmails(): Promise<void> {
  try {
    logger.info('🌟 Starting weekly motivational emails scheduling...');

    const result = await NotificacionesProgramadasService.scheduleWeeklyMotivationalEmails();

    if (result.success && result.data) {
      logger.info(`🌟 Weekly motivational emails scheduling completed: ${result.data.programadas} emails programados, ${result.data.errores} errores`);
    } else {
      logger.error('❌ Error in weekly motivational emails scheduling:', result.error);
    }

  } catch (error) {
    logger.error('❌ Critical error in weekly motivational emails scheduling:', error);
  }
}

/**
 * Procesa todas las notificaciones pendientes y envía correos electrónicos
 *
 * Esta función se ejecuta cada minuto para procesar todas las notificaciones
 * programadas pendientes en la base de datos. Envía correos electrónicos
 * según el tipo de notificación y marca como enviadas las exitosas.
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
        logger.info(`📤 Processing notification ${notification.idNotificacion} (${notification.tipo}) for user ${notification.usuario?.correo || 'unknown'}`);

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
            // Correccion: Calcular mensaje motivacional de la semana actual al momento del envio
            // Esto asegura que cada semana se envie un mensaje diferente, independientemente
            // de cuando fue programada la notificacion
            subject = 'Motivación Semanal - Focus-Up';
            const currentWeek = getCurrentWeekNumber();
            const currentMessage = getWeeklyMotivationalMessage(currentWeek);
            logger.info(`Enviando mensaje motivacional de la semana ${currentWeek}: ${currentMessage}`);
            html = generateMotivationEmailTemplate(currentMessage);
            break;

          default:
            logger.warn(`Unknown notification type: ${notification.tipo} for notification ${notification.idNotificacion}`);
            continue;
        }

        // Send the email
        if (notification.usuario && notification.usuario.correo) {
          emailSent = await sendEmail(notification.usuario.correo, subject, html);
        } else {
          logger.error(`No user or email address found for notification ${notification.idNotificacion} (user ID: ${notification.idUsuario})`);
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
 * Inicializa la conexión a la base de datos y arranca el trabajo cron
 *
 * Esta función establece la conexión con la base de datos, verifica la configuración
 * del correo electrónico y configura los trabajos programados para el envío automático
 * de notificaciones.
 */
async function initialize(): Promise<void> {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('✅ Database connection established for email processor');

    // Test email configuration
    await transporter.verify();
    logger.info('✅ Email transporter verified successfully');

    // Start cron job - runs every 10 seconds for email sending (improved timing)
    cron.schedule('*/10 * * * * *', processPendingEmails);
    logger.info('🚀 Automated email delivery system started - running every 10 seconds');

    // Start daily cron job for session notifications - runs daily at 2 AM
    cron.schedule('0 2 * * *', processSessionNotifications);
    logger.info('🚀 Session notification system started - running daily at 2 AM');

    // Start daily cron job for cleanup of expired verification codes - runs daily at 3 AM
    cron.schedule('0 3 * * *', cleanupExpiredVerificationCodes);
    logger.info('🚀 Verification codes cleanup system started - running daily at 3 AM');

    // Start weekly cron job for motivational emails - runs every Sunday at 9 AM
    cron.schedule('0 9 * * 0', scheduleWeeklyMotivationalEmails);
    logger.info('🚀 Weekly motivational emails system started - running every Sunday at 9 AM');

    // Run initial checks
    await processPendingEmails();
    await processSessionNotifications();
    await cleanupExpiredVerificationCodes();
    await scheduleWeeklyMotivationalEmails();

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
