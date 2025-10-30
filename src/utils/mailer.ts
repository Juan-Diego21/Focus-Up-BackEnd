
import nodemailer from "nodemailer";
import logger from "./logger";

/**
 * Utilidades para envío de correos electrónicos
 * Configura y maneja el envío de emails para funcionalidades como restablecimiento de contraseña
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
  },
});

/**
 * Envía un email con código de verificación para restablecimiento de contraseña
 * Utiliza una plantilla HTML profesional con estilos inline
 */
export async function sendResetEmail(to: string, name: string, code: string): Promise<void> {
  try {
    const mailOptions = {
      from: `"Focus-Up" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Código de verificación para restablecer contraseña",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificación</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #007bff;
              margin-bottom: 10px;
            }
            .code-container {
              background-color: #f8f9fa;
              border: 2px dashed #007bff;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #007bff;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              font-size: 14px;
              color: #6c757d;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Focus-Up</div>
              <h2>Restablecimiento de Contraseña</h2>
            </div>

            <p>Hola <strong>${name}</strong>,</p>

            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar con el proceso, utiliza el siguiente código de verificación:</p>

            <div class="code-container">
              <div class="code">${code}</div>
            </div>

            <div class="warning">
              <strong>Importante:</strong>
              <ul>
                <li>Este código expirará en <strong>10 minutos</strong></li>
                <li>Solo puede ser utilizado una vez</li>
                <li>No compartas este código con nadie</li>
              </ul>
            </div>

            <p>Si no solicitaste este restablecimiento de contraseña, puedes ignorar este mensaje. Tu contraseña permanecerá segura.</p>

            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>

            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>&copy; 2024 Focus-Up. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Código de verificación enviado exitosamente a: ${to}`);
  } catch (error) {
    logger.error("Error enviando código de verificación por email:", error);
    throw error;
  }
}