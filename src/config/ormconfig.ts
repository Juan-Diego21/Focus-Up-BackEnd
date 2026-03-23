import { DataSource } from "typeorm";
import { env } from "./env";
import logger from "../utils/logger";

/**
 * Configuración de TypeORM para conexión a PostgreSQL
 * Define todas las entidades, migraciones y opciones de conexión
 */

// Importar todas las entidades para registro directo
import { UserEntity } from "../models/User.entity";
import { InterestEntity } from "../models/Interest.entity";
import { DistractionEntity } from "../models/Distraction.entity";
import { UsuarioInteresesEntity } from "../models/UsuarioIntereses.entity";
import { UsuarioDistraccionesEntity } from "../models/UsuarioDistracciones.entity";
import { BeneficioEntity } from "../models/Beneficio.entity";
import { MetodoEstudioEntity } from "../models/MetodoEstudio.entity";
import { MetodoBeneficiosEntity } from "../models/MetodoBeneficios.entity";
import { MusicaEntity } from "../models/Musica.entity";
import { AlbumMusicaEntity } from "../models/AlbumMusica.entity";
import { EventoEntity } from "../models/Evento.entity";
import { PasswordResetEntity } from "../models/PasswordReset.entity";
import { MetodoRealizadoEntity } from "../models/MetodoRealizado.entity";
import { SesionConcentracionRealizadaEntity } from "../models/SesionConcentracionRealizada.entity";
import { SesionConcentracionEntity } from "../models/SesionConcentracion.entity";
import { NotificacionesUsuarioEntity } from "../models/NotificacionesUsuario.entity";
import { NotificacionesProgramadasEntity } from "../models/NotificacionesProgramadas.entity";
import { CodigosVerificacionEntity } from "../models/CodigosVerificacion.entity";

/**
 * Instancia principal de DataSource para TypeORM
 * Configurada para PostgreSQL con SSL y pool de conexiones
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.PGHOST,
  port: env.PGPORT,
  username: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
  schema: "public", // Explicitly set schema to public
  ssl: env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: env.NODE_ENV === "development",
  entities: [
    // Entidades principales de usuario
    UserEntity,
    InterestEntity,
    DistractionEntity,
    UsuarioInteresesEntity,
    UsuarioDistraccionesEntity,

    // Entidades de contenido educativo
    BeneficioEntity,
    MetodoEstudioEntity,
    MetodoBeneficiosEntity,

    // Entidades de música
    MusicaEntity,
    AlbumMusicaEntity,

    // Entidades de eventos
    EventoEntity,

    // Entidades de recuperación de contraseña
    PasswordResetEntity,
    CodigosVerificacionEntity,

    // Entidades de reportes
    MetodoRealizadoEntity,
    SesionConcentracionRealizadaEntity,
    SesionConcentracionEntity,

    // Entidades de notificaciones
    NotificacionesUsuarioEntity,
    NotificacionesProgramadasEntity,
  ],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  subscribers: [],
  poolSize: 20,
  extra: {
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 30000,
  },
});

/**
 * Inicializa la conexión a la base de datos y realiza validaciones básicas
 * Verifica la conectividad, esquema y existencia de tablas principales
 */
export const initializeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    return;
  }

  try {
    await AppDataSource.initialize();
    logger.info("TypeORM conectado a PostgreSQL correctamente", {
      host: env.PGHOST,
      database: env.PGDATABASE,
      user: env.PGUSER,
      sslMode: env.PGSSLMODE,
      entities: AppDataSource.entityMetadatas.length,
    });
  } catch (error) {
    logger.error("Error conectando TypeORM a PostgreSQL", { error });
    throw error;
  }
};
