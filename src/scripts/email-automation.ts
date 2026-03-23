import "reflect-metadata";
import { AppDataSource, initializeDatabase } from "../config/ormconfig";
import { runEmailAutomationCycle } from "../jobs/emailAutomationJob";
import logger from "../utils/logger";

/**
 * Cierra la conexion de TypeORM de forma segura al terminar el script.
 * Esto evita conexiones colgadas cuando se ejecuta en runners de CI/CD.
 */
const closeDatabaseConnection = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) return;

  try {
    await AppDataSource.destroy();
    logger.info("Conexion de base de datos cerrada correctamente");
  } catch (error) {
    logger.error("Error cerrando conexion de base de datos", { error });
  }
};

/**
 * Ejecuta un ciclo unico de automatizacion de correos.
 * Esta disenado para ser llamado por cron externo (GitHub Actions).
 */
export const runEmailAutomationScript = async (): Promise<number> => {
  try {
    // Abrimos conexion de datos y ejecutamos el ciclo de negocio desacoplado.
    await initializeDatabase();
    const summary = await runEmailAutomationCycle();

    // Mostrar resumen en stdout para visibilidad directa en GitHub Actions.
    console.log("[email-automation] summary:", JSON.stringify(summary));
    logger.info("Script de automatizacion ejecutado correctamente", summary);
    return 0;
  } catch (error) {
    console.error("[email-automation] fatal error:", error);
    logger.error("Fallo critico en script de automatizacion de correos", {
      error,
    });
    return 1;
  } finally {
    // Siempre cerramos recursos para dejar el runner en estado limpio.
    await closeDatabaseConnection();
  }
};

/**
 * Permite ejecucion directa desde CLI:
 * `ts-node src/scripts/email-automation.ts`
 */
if (require.main === module) {
  void runEmailAutomationScript().then((exitCode) => {
    process.exit(exitCode);
  });
}
