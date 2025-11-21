const {
  NotificacionesProgramadasService,
} = require("./dist/services/NotificacionesProgramadasService.js");

async function testEmail() {
  try {
    console.log("Creating test notification...");
    const now = new Date();
    now.setSeconds(now.getSeconds() + 30); // 30 seconds from now

    const result =
      await NotificacionesProgramadasService.createScheduledNotification({
        idUsuario: 51,
        tipo: "test",
        titulo: "Test Email - Focus-Up",
        mensaje: JSON.stringify({
          test: "This is a test email from Focus-Up",
          timestamp: new Date().toISOString(),
        }),
        fechaProgramada: now,
      });

    console.log("Test notification created:", result);
    console.log("Waiting 35 seconds for email to be sent...");

    setTimeout(() => {
      console.log("Test completed. Check email and logs.");
      process.exit(0);
    }, 35000);
  } catch (error) {
    console.error("Error creating test notification:", error);
    process.exit(1);
  }
}

testEmail();
