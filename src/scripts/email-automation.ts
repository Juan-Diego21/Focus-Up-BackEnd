import "reflect-metadata";
import { AppDataSource, initializeDatabase } from "../config/ormconfig";
import { runEmailAutomationCycle } from "../jobs/emailAutomationJob";
import logger from "../utils/logger";

/**
 * Cierra la conexión de TypeORM de forma segura al terminar el script.
 * Esto evita conexiones colgadas cuando se ejecuta en runners de CI/CD.
 */
const closeDatabaseConnection = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) return;

  try {
    await AppDataSource.destroy();
    logger.info("Conexión de base de datos cerrada correctamente");
  } catch (error) {
    logger.error("Error cerrando conexión de base de datos", { error });
  }
};

/**
 * Ejecuta un ciclo único de automatización de correos.
 * Está diseñado para ser llamado por cron externo (GitHub Actions).
 */
export const runEmailAutomationScript = async (): Promise<number> => {
  try {
    // Abrimos conexión de datos y ejecutamos el ciclo de negocio desacoplado.
    await initializeDatabase();
    const summary = await runEmailAutomationCycle();

    logger.info("Script de automatización ejecutado correctamente", summary);
    return 0;
  } catch (error) {
    logger.error("Fallo crítico en script de automatización de correos", {
      error,
    });
    return 1;
  } finally {
    // Siempre cerramos recursos para dejar el runner en estado limpio.
    await closeDatabaseConnection();
  }
};

/**
 * Permite ejecución directa desde CLI:
 * `ts-node src/scripts/email-automation.ts`
 */
if (require.main === module) {
  void runEmailAutomationScript().then((exitCode) => {
    process.exit(exitCode);
  });
}
