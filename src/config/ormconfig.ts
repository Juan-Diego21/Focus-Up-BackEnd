// src/config/ormconfig.ts
import { DataSource } from "typeorm";
import { env } from "./env";

// Exportar la instancia para uso global
export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.PGHOST,
  port: env.PGPORT,
  username: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
  ssl: env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: env.NODE_ENV === "development",
  entities: [
    __dirname + "/../models/User.entity{.ts,.js}",
    __dirname + "/../models/Interest.entity{.ts,.js}",
    __dirname + "/../models/Distraction.entity{.ts,.js}",
    __dirname + "/../models/UsuarioIntereses.entity{.ts,.js}",
    __dirname + "/../models/UsuarioDistracciones.entity{.ts,.js}",
  ],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  subscribers: [],
  poolSize: 20,
  extra: {
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 30000,
  },
});

// Función para inicializar la conexión
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("✅ TypeORM conectado a PostgreSQL correctamente");
  } catch (error) {
    console.error("❌ Error conectando TypeORM a PostgreSQL:", error);
    throw error;
  }
};
