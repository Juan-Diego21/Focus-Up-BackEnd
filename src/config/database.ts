import { Pool, PoolConfig } from "pg";
import { env } from "./env";

// Interface para tipar nuestra configuración de base de datos
interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// Configuración del pool de conexiones
const dbConfig: DatabaseConfig = {
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  ssl: env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
};

// Crear el pool de conexiones
const pool = new Pool(dbConfig);

// Manejar eventos de error del pool
pool.on("error", (err: Error) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

// Función para probar la conexión a la base de datos
export const testConnection = async (): Promise<boolean> => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    console.log(
      "✅ Conexión a PostgreSQL exitosa. Hora actual:",
      result.rows[0].current_time
    );
    return true;
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Función para ejecutar consultas de forma segura - VERSIÓN CORREGIDA
export const executeQuery = async (
  query: string,
  params: any[] = []
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
}> => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(query, params);

    return {
      success: true,
      data: result.rows,
      rowCount: result.rowCount || 0, // <- Manejo de null
    };
  } catch (error) {
    console.error("❌ Error en consulta PostgreSQL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Exportar el pool para uso en repositorios
export default pool;
