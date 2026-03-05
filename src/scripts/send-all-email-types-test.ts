#!/usr/bin/env ts-node
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const to = "jdmend21@gmail.com";

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

const wrapEmailTemplate = (title: string, subtitle: string, accentColor: string, content: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
    .container { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #e9ecef; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid ${accentColor}; }
    .brand-text { font-size: 32px; font-weight: 700; color: #007bff; margin: 0; letter-spacing: -0.5px; }
    .subtitle { font-size: 16px; color: #6c757d; margin: 8px 0 0 0; font-weight: 500; }
    .box { padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${accentColor}; background: #f8f9fa; }
    .highlight { padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #d5e7ff; background: #eef5ff; }
    .highlight p { margin: 0; color: #0c5460; font-weight: 500; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; text-align: center; }
    .cta a { display: inline-block; margin-top: 10px; padding: 10px 14px; border-radius: 6px; background: ${accentColor}; color: #fff !important; text-decoration: none; font-weight: 600; }
    @media (max-width: 480px) { body { padding: 10px; } .container { padding: 20px; } .brand-text { font-size: 28px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-text">Focus-Up</h1>
      <p class="subtitle">${subtitle}</p>
    </div>
    ${content}
    <div class="footer">
      <p>Este es un mensaje autom&aacute;tico de Focus-Up.</p>
    </div>
  </div>
</body>
</html>`;

const emails = [
  {
    subject: "[PRUEBA] Recordatorio: Evento",
    html: wrapEmailTemplate(
      "Recordatorio de Evento - Focus-Up",
      "Recordatorio de Evento",
      "#007bff",
      `
      <p>Hola, te recordamos que tienes un evento proximo:</p>
      <div class="box">
        <p><strong>Repaso de Algebra</strong></p>
        <p>Fecha: 2026-03-06</p>
        <p>Hora: 18:30</p>
        <p>Descripcion: Practica de ejercicios capitulo 3.</p>
        <p class="cta"><a href="http://localhost:5173/start-session?eventId=123">Iniciar sesion de concentracion</a></p>
      </div>
      <div class="highlight"><p>No pierdas el ritmo. Planifica unos minutos antes para empezar con foco.</p></div>
      `
    ),
  },
  {
    subject: "[PRUEBA] Recordatorio: Metodo de estudio pendiente",
    html: wrapEmailTemplate(
      "Recordatorio de Metodo de Estudio - Focus-Up",
      "Recordatorio de Metodo Pendiente",
      "#ffc107",
      `
      <p>Hola, tienes un metodo de estudio pendiente por continuar:</p>
      <div class="box" style="border-left-color:#ffc107;background:#fff8e1;">
        <p><strong>Metodo:</strong> Pomodoro</p>
        <p><strong>Progreso actual:</strong> 45%</p>
      </div>
      <div class="highlight"><p>Un avance corto hoy mantiene el impulso. Continua donde lo dejaste.</p></div>
      `
    ),
  },
  {
    subject: "[PRUEBA] Recordatorio: Sesion de concentracion pendiente",
    html: wrapEmailTemplate(
      "Recordatorio de Sesion de Concentracion - Focus-Up",
      "Recordatorio de Sesion Pendiente",
      "#28a745",
      `
      <p>Hola, tienes una sesion de concentracion pendiente:</p>
      <div class="box" style="border-left-color:#28a745;background:#edf9f0;">
        <p><strong>Sesion profunda - 50 minutos</strong></p>
        <p class="cta"><a href="http://localhost:5173/events?sessionId=987">Ir a mis eventos/sesiones</a></p>
      </div>
      <div class="highlight"><p>Retoma tu sesion y suma otro bloque de progreso a tu objetivo.</p></div>
      `
    ),
  },
  {
    subject: "[PRUEBA] Motivacion semanal - Focus-Up",
    html: wrapEmailTemplate(
      "Motivacion Semanal - Focus-Up",
      "Motivacion Semanal",
      "#6f42c1",
      `
      <p>Hola, aqui tienes tu mensaje motivacional de la semana:</p>
      <div class="box" style="border-left-color:#6f42c1;background:#f4efff;">
        <p><strong>"Cada sesion cuenta. Tu constancia hoy es tu resultado de manana."</strong></p>
      </div>
      <div class="highlight"><p>Una semana a la vez, con enfoque constante y progreso real.</p></div>
      `
    ),
  },
];

async function main(): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER y EMAIL_PASS son requeridos");
  }

  await transporter.verify();

  for (const email of emails) {
    await transporter.sendMail({
      from: `"Focus-Up (PRUEBA)" <${process.env.EMAIL_USER}>`,
      to,
      subject: email.subject,
      html: email.html,
    });
    console.log(`Enviado: ${email.subject}`);
  }

  console.log(`Todos los correos de prueba fueron enviados a ${to}`);
}

main().catch((error) => {
  console.error("Error enviando correos de prueba:", error);
  process.exit(1);
});

