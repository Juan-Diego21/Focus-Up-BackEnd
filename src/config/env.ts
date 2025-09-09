import dotenv from "dotenv";

// Cargar variables de entorno desde .env
dotenv.config();

// Interface para tipar nuestras variables de entorno
interface Env {
  PORT: number;
  NODE_ENV: string;
  DB_SERVER: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  API_PREFIX: string;
}

// Validar y exportar variables de entorno con tipado
export const env: Env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_SERVER: process.env.DB_SERVER || "localhost",
  DB_NAME: process.env.DB_NAME || "FocusUpDB",
  DB_USER: process.env.DB_USER || "sa",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_PORT: parseInt(process.env.DB_PORT || "1433", 10),
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
};

// Validar variables críticas
if (!env.DB_PASSWORD) {
  console.warn(
    "DB_PASSWORD no está configurada. La conexión a la base de datos fallará."
  );
}
