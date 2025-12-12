
import nodemailer from "nodemailer";
import logger from "./logger";

/**
 * Utilidades para envío de correos electrónicos
 * Configura y maneja el envío de emails para funcionalidades como restablecimiento de contraseña
 *
 * Este módulo proporciona funciones para enviar correos electrónicos con plantillas HTML
 * que siguen el diseño de la aplicación Focus-Up. Todas las plantillas incluyen el logo
 * de la aplicación y colores consistentes con el tema oscuro del proyecto.
 */

// Configuración del transportador de correo electrónico
// Utiliza variables de entorno para la configuración SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Servidor SMTP (Gmail por defecto)
  port: parseInt(process.env.SMTP_PORT || "587"), // Puerto SMTP (587 para TLS)
  secure: process.env.SMTP_SECURE === "true", // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER!, // Usuario de correo electrónico
    pass: process.env.EMAIL_PASS!, // Contraseña de aplicación
  },
  tls: {
    rejectUnauthorized: false, // Permite certificados autofirmados si es necesario
  },
});

/**
 * Envía un email con código de verificación para restablecimiento de contraseña
 * Utiliza una plantilla HTML profesional con estilos inline que sigue el diseño de Focus-Up
 *
 * @param to - Dirección de correo electrónico del destinatario
 * @param name - Nombre del usuario para personalizar el mensaje
 * @param code - Código de verificación de 6 dígitos
 * @returns Promise que se resuelve cuando el email es enviado exitosamente
 */
export async function sendResetEmail(to: string, name: string, code: string): Promise<void> {
  try {
    // Configuración del email con remitente personalizado
    const mailOptions = {
      from: `"Focus-Up" <${process.env.EMAIL_USER}>`, // Remitente personalizado con el nombre de la app
      to, // Destinatario del email
      subject: "Código de verificación para restablecer contraseña", // Asunto del email
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificación - Focus-Up</title>
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
            .code-container {
              background-color: #f8f9fa;
              border: 2px dashed #007bff;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 25px 0;
            }
            .code {
              font-size: 36px;
              font-weight: 700;
              font-family: 'Courier New', monospace;
              color: #007bff;
              letter-spacing: 6px;
              margin: 0;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .warning strong {
              color: #856404;
              display: block;
              margin-bottom: 12px;
              font-weight: 600;
            }
            .warning ul {
              margin: 0;
              padding-left: 20px;
            }
            .warning li {
              margin-bottom: 6px;
              color: #856404;
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
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
              color: #0056b3;
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
              <p class="subtitle">🔐 Restablecimiento de Contraseña</p>
            </div>

            <div class="content">
              <p>Hola <strong>${name}</strong>,</p>

              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar con el proceso, utiliza el siguiente código de verificación:</p>

              <div class="code-container">
                <div class="code">${code}</div>
              </div>

              <div class="warning">
                <strong>Importante:</strong>
                <ul>
                  <li>Este código expirará en <span class="highlight">10 minutos</span></li>
                  <li>Solo puede ser utilizado <span class="highlight">una vez</span></li>
                  <li><span class="highlight">No compartas</span> este código con nadie</li>
                </ul>
              </div>

              <p>Si no solicitaste este restablecimiento de contraseña, puedes ignorar este mensaje. Tu contraseña permanecerá segura.</p>

              <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            </div>

            <div class="footer">
              <p>Este es un mensaje automático de Focus-Up.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Envía el email usando el transportador configurado
    await transporter.sendMail(mailOptions);

    // Registra el envío exitoso en los logs
    logger.info(`Código de verificación enviado exitosamente a: ${to}`);
  } catch (error) {
    // Registra el error en los logs y relanza la excepción
    logger.error("Error enviando código de verificación por email:", error);
    throw error;
  }
}

/**
 * Envía un email con código de verificación para registro de usuario
 * Utiliza una plantilla HTML profesional con estilos inline que sigue el diseño de Focus-Up
 *
 * @param to - Dirección de correo electrónico del destinatario
 * @param code - Código de verificación de 6 dígitos
 * @returns Promise que se resuelve cuando el email es enviado exitosamente
 */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  try {
    // Configuración del email con remitente personalizado
    const mailOptions = {
      from: `"Focus-Up" <${process.env.EMAIL_USER}>`, // Remitente personalizado con el nombre de la app
      to, // Destinatario del email
      subject: "Código de verificación para registro - Focus-Up", // Asunto del email
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificación - Focus-Up</title>
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
            .code-container {
              background-color: #f8f9fa;
              border: 2px dashed #007bff;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 25px 0;
            }
            .code {
              font-size: 36px;
              font-weight: 700;
              font-family: 'Courier New', monospace;
              color: #007bff;
              letter-spacing: 6px;
              margin: 0;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .warning strong {
              color: #856404;
              display: block;
              margin-bottom: 12px;
              font-weight: 600;
            }
            .warning ul {
              margin: 0;
              padding-left: 20px;
            }
            .warning li {
              margin-bottom: 6px;
              color: #856404;
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
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
              color: #0056b3;
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
              <p class="subtitle">🔐 Verificación de Email</p>
            </div>

            <div class="content">
              <p>¡Bienvenido a <strong>Focus-Up</strong>!</p>

              <p>Para completar tu registro, utiliza el siguiente código de verificación:</p>

              <div class="code-container">
                <div class="code">${code}</div>
              </div>

              <div class="warning">
                <strong>Importante:</strong>
                <ul>
                  <li>Este código expirará en <span class="highlight">10 minutos</span></li>
                  <li>Solo puede ser utilizado <span class="highlight">una vez</span></li>
                  <li><span class="highlight">No compartas</span> este código con nadie</li>
                </ul>
              </div>

              <p>Si no solicitaste este registro, puedes ignorar este mensaje. Tu email permanecerá seguro.</p>

              <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            </div>

            <div class="footer">
              <p>Este es un mensaje automático de Focus-Up.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Envía el email usando el transportador configurado
    await transporter.sendMail(mailOptions);

    // Registra el envío exitoso en los logs
    logger.info(`Código de verificación enviado exitosamente a: ${to}`);
  } catch (error) {
    // Registra el error en los logs y relanza la excepción
    logger.error("Error enviando código de verificación por email:", error);
    throw error;
  }
}