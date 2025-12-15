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
exports.sendTestMotivationalEmail = sendTestMotivationalEmail;
const dotenv = __importStar(require("dotenv"));
const motivationalMessages_1 = require("../config/motivationalMessages");
const logger_1 = __importDefault(require("../utils/logger"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv.config();
function generateMotivationEmailTemplate(message) {
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
          <p class="subtitle">🌟 Motivación Semanal - PRUEBA</p>
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
          <p>Este es un email de PRUEBA del sistema de Focus-Up.</p>
          <p><strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-CO')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function sendTestMotivationalEmail(to) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number.parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const currentWeek = (0, motivationalMessages_1.getCurrentWeekNumber)();
        const mensajeSemanal = (0, motivationalMessages_1.getWeeklyMotivationalMessage)(currentWeek);
        logger_1.default.info(`📧 Enviando email motivacional de PRUEBA a ${to}`);
        logger_1.default.info(`📅 Semana actual: ${currentWeek}`);
        logger_1.default.info(`💬 Mensaje: "${mensajeSemanal}"`);
        const mailOptions = {
            from: `"Focus-Up (PRUEBA)" <${process.env.EMAIL_USER}>`,
            to,
            subject: '🌟 Motivación Semanal - Focus-Up (PRUEBA)',
            html: generateMotivationEmailTemplate(mensajeSemanal),
        };
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`✅ Email motivacional de PRUEBA enviado exitosamente a: ${to}`);
        return true;
    }
    catch (error) {
        logger_1.default.error(`❌ Error al enviar email de PRUEBA a ${to}:`, error);
        return false;
    }
}
async function main() {
    try {
        logger_1.default.info('🚀 Iniciando envío de email motivacional de PRUEBA...');
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            logger_1.default.error('❌ Variables de entorno EMAIL_USER y EMAIL_PASS son requeridas');
            process.exit(1);
        }
        const testEmail = 'jdmend21@gmail.com';
        const success = await sendTestMotivationalEmail(testEmail);
        if (success) {
            logger_1.default.info('🎉 Email motivacional de PRUEBA enviado exitosamente!');
            logger_1.default.info(`📧 Revisa la bandeja de entrada de ${testEmail}`);
        }
        else {
            logger_1.default.error('❌ Falló el envío del email motivacional de PRUEBA');
            process.exit(1);
        }
    }
    catch (error) {
        logger_1.default.error('❌ Error crítico en el envío de email de PRUEBA:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch((error) => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
}
