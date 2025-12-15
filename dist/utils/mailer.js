"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = sendResetEmail;
exports.sendVerificationEmail = sendVerificationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
async function sendResetEmail(to, name, code) {
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
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`Código de verificación enviado exitosamente a: ${to}`);
    }
    catch (error) {
        logger_1.default.error("Error enviando código de verificación por email:", error);
        throw error;
    }
}
async function sendVerificationEmail(to, code) {
    try {
        const mailOptions = {
            from: `"Focus-Up" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Código de verificación para registro - Focus-Up",
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
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`Código de verificación enviado exitosamente a: ${to}`);
    }
    catch (error) {
        logger_1.default.error("Error enviando código de verificación por email:", error);
        throw error;
    }
}
