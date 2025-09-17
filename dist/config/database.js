"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = exports.testConnection = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const dbConfig = {
    host: env_1.env.PGHOST,
    port: env_1.env.PGPORT,
    database: env_1.env.PGDATABASE,
    user: env_1.env.PGUSER,
    password: env_1.env.PGPASSWORD,
    ssl: env_1.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
};
const pool = new pg_1.Pool(dbConfig);
pool.on("error", (err) => {
    console.error("❌ Unexpected error on idle client", err);
    process.exit(-1);
});
const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query("SELECT NOW() as current_time");
        console.log("✅ Conexión a PostgreSQL exitosa. Hora actual:", result.rows[0].current_time);
        return true;
    }
    catch (error) {
        console.error("❌ Error conectando a PostgreSQL:", error);
        return false;
    }
    finally {
        if (client) {
            client.release();
        }
    }
};
exports.testConnection = testConnection;
const executeQuery = async (query, params = []) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(query, params);
        return {
            success: true,
            data: result.rows,
            rowCount: result.rowCount || 0,
        };
    }
    catch (error) {
        console.error("❌ Error en consulta PostgreSQL:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
    finally {
        if (client) {
            client.release();
        }
    }
};
exports.executeQuery = executeQuery;
exports.default = pool;
