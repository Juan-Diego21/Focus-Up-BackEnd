"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = sendResetEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
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
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #ffffff;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: linear-gradient(135deg, #171717 0%, #1a1a1a 100%);
              min-height: 100vh;
            }
            .container {
              background: linear-gradient(135deg, rgba(35, 35, 35, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
              backdrop-filter: blur(16px);
              padding: 40px;
              border-radius: 24px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(6, 144, 207, 0.2);
              position: relative;
              overflow: hidden;
            }
            .container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #0690cf 0%, #00d4ff 50%, #0690cf 100%);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              margin-bottom: 20px;
            }
            .logo {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              background: linear-gradient(135deg, rgba(6, 144, 207, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid rgba(6, 144, 207, 0.3);
            }
            .logo img {
              width: 32px;
              height: 32px;
              object-fit: contain;
            }
            .brand-text {
              font-size: 28px;
              font-weight: 700;
              background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin: 0;
            }
            .subtitle {
              font-size: 18px;
              font-weight: 500;
              color: #e0f2fe;
              margin: 8px 0 0 0;
            }
            .content {
              color: #ffffff;
              margin-bottom: 30px;
            }
            .code-container {
              background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(35, 35, 35, 0.8) 100%);
              border: 2px dashed rgba(6, 144, 207, 0.5);
              border-radius: 16px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              position: relative;
            }
            .code-container::before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              background: linear-gradient(45deg, rgba(6, 144, 207, 0.1), rgba(0, 212, 255, 0.1));
              border-radius: 18px;
              z-index: -1;
            }
            .code {
              font-size: 36px;
              font-weight: 700;
              font-family: 'Courier New', monospace;
              background: linear-gradient(135deg, #0690cf 0%, #00d4ff 100%);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              letter-spacing: 6px;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            .warning {
              background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
              border: 1px solid rgba(245, 158, 11, 0.3);
              color: #fbbf24;
              padding: 20px;
              border-radius: 12px;
              margin: 30px 0;
              position: relative;
            }
            .warning::before {
              content: '⚠️';
              font-size: 20px;
              margin-right: 8px;
            }
            .warning strong {
              color: #fbbf24;
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
              color: #fcd34d;
            }
            .footer {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              font-size: 14px;
              color: #9ca3af;
              text-align: center;
            }
            .footer p {
              margin: 8px 0;
            }
            .accent-text {
              color: #e0f2fe;
            }
            .highlight {
              background: linear-gradient(135deg, rgba(6, 144, 207, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%);
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <div class="logo">
                  <img src="https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/imagenes%20proyecto/Logo.png" alt="Focus-Up Logo" />
                </div>
                <div>
                  <h1 class="brand-text">Focus-Up</h1>
                  <p class="subtitle">Restablecimiento de Contraseña</p>
                </div>
              </div>
            </div>

            <div class="content">
              <p>Hola <span class="accent-text"><strong>${name}</strong></span>,</p>

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
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>&copy; 2024 Focus-Up. Todos los derechos reservados.</p>
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
