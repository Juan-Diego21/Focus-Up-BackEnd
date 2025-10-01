import nodemailer from "nodemailer";
export async function sendEmail(to: string, subject: string, html: string) {
  // Configura el transporter con tus credenciales SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.tuservidor.com", // Ejemplo: smtp.gmail.com
    port: 587,
    secure: false,
    auth: {
      user: "TU_CORREO", // Tu correo
      pass: "TU_CONTRASEÑA", // Tu contraseña o app password
    },
  });

  // Envía el correo
  await transporter.sendMail({
    from: '"Focus Up" <TU_CORREO>',
    to,
    subject,
    html,
  });
}