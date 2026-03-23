/**
 * Script legado de compatibilidad.
 * Mantiene el nombre histórico para no romper automatizaciones existentes,
 * pero delega toda la ejecución al nuevo entrypoint desacoplado.
 */
import { runEmailAutomationScript } from "./email-automation";

void runEmailAutomationScript().then((exitCode) => {
  process.exit(exitCode);
});
