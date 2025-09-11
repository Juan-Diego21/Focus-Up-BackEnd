import dotenv from "dotenv";
import path from "path";

// Cargar variables desde .env - CON RUTA ABSOLUTA
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

// Interface para tipar nuestras variables de entorno
interface Env {
  // Server Configuration
  PORT: number;
  NODE_ENV: string;
  API_PREFIX: string;

  // Database Configuration (Neon.tech PostgreSQL)
  PGHOST: string;
  PGPORT: number;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
  PGSSLMODE: string;
}

// Validar y exportar variables de entorno con tipado
export const env: Env = {
  // Server Configuration
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  API_PREFIX: process.env.API_PREFIX || "/api/v1",

  // Database Configuration
  PGHOST: process.env.PGHOST || "",
  PGPORT: parseInt(process.env.PGPORT || "5432", 10),
  PGDATABASE: process.env.PGDATABASE || "",
  PGUSER: process.env.PGUSER || "",
  PGPASSWORD: process.env.PGPASSWORD || "",
  PGSSLMODE: process.env.PGSSLMODE || "require",
};

// Debug: Verificar que las variables se cargan
console.log("🔍 Variables de entorno cargadas:");
console.log("PORT:", env.PORT);
console.log("NODE_ENV:", env.NODE_ENV);
console.log("API_PREFIX:", env.API_PREFIX);
console.log("PGHOST:", env.PGHOST ? "✅ Presente" : "❌ Faltante");
console.log("PGDATABASE:", env.PGDATABASE ? "✅ Presente" : "❌ Faltante");
console.log("PGUSER:", env.PGUSER ? "✅ Presente" : "❌ Faltante");
console.log("PGPASSWORD:", env.PGPASSWORD ? "✅ Presente" : "❌ Faltante");

// Validación de variables críticas
if (!env.PGHOST) throw new Error("❌ PGHOST no está configurada en .env");
if (!env.PGDATABASE)
  throw new Error("❌ PGDATABASE no está configurada en .env");
if (!env.PGUSER) throw new Error("❌ PGUSER no está configurada en .env");
if (!env.PGPASSWORD)
  throw new Error("❌ PGPASSWORD no está configurada en .env");

console.log("✅ Configuración de entorno cargada correctamente");
