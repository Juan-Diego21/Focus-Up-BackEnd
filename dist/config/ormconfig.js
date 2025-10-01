"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: env_1.env.PGHOST,
    port: env_1.env.PGPORT,
    username: env_1.env.PGUSER,
    password: env_1.env.PGPASSWORD,
    database: env_1.env.PGDATABASE,
    ssl: env_1.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: env_1.env.NODE_ENV === "development",
    entities: [
        __dirname + "/../models/User.entity{.ts,.js}",
        __dirname + "/../models/Interest.entity{.ts,.js}",
        __dirname + "/../models/Distraction.entity{.ts,.js}",
        __dirname + "/../models/UsuarioIntereses.entity{.ts,.js}",
        __dirname + "/../models/UsuarioDistracciones.entity{.ts,.js}",
        __dirname + "/../models/MedotoEstudio.entity{.ts,.js}",
        __dirname + "/../models/Evento.entity{.ts,.js}",
    ],
    migrations: [__dirname + "/../migrations/*{.ts,.js}"],
    subscribers: [],
    poolSize: 20,
    extra: {
        connectionTimeoutMillis: 20000,
        idleTimeoutMillis: 30000,
    },
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("✅ TypeORM conectado a PostgreSQL correctamente");
    }
    catch (error) {
        console.error("❌ Error conectando TypeORM a PostgreSQL:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
