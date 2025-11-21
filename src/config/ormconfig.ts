import { DataSource } from "typeorm";
import { env } from "./env";

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
import { NotificacionesUsuarioEntity } from "../models/NotificacionesUsuario.entity";
import { NotificacionesProgramadasEntity } from "../models/NotificacionesProgramadas.entity";

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

    // Entidades de reportes
    MetodoRealizadoEntity,
    SesionConcentracionRealizadaEntity,

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
  try {
    await AppDataSource.initialize();
    console.log("✅ TypeORM conectado a PostgreSQL correctamente");

    // Log connection details
    console.log(`👤 Conectado como usuario: ${env.PGUSER}`);
    console.log(`🗄️ Base de datos: ${env.PGDATABASE}`);

    // Log entities loaded
    const entityMetadatas = AppDataSource.entityMetadatas;
    console.log(`📊 Entidades cargadas por TypeORM: ${entityMetadatas.length}`);
    entityMetadatas.forEach(entity => {
      console.log(`  - ${entity.name} -> tabla: ${entity.tableName} (schema: ${entity.schema || 'public'})`);
    });

    // Test basic connection and schema
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const schemaResult = await queryRunner.query('SELECT current_schema() as schema, current_user as user');
      console.log(`📍 Schema actual: ${schemaResult[0].schema}`);
      console.log(`👤 Usuario de BD: ${schemaResult[0].user}`);

      // Test if usuario table exists
      const tableCheck = await queryRunner.query(`
        SELECT schemaname, tablename, tableowner
        FROM pg_tables
        WHERE tablename = 'usuario'
        AND schemaname = 'public'
      `);

      if (tableCheck.length > 0) {
        console.log(`✅ Tabla 'usuario' encontrada en schema '${tableCheck[0].schemaname}' - Owner: ${tableCheck[0].tableowner}`);
      } else {
        console.log(`❌ Tabla 'usuario' NO encontrada en schema 'public'`);
        // List all tables in public schema
        const allTables = await queryRunner.query(`
          SELECT schemaname, tablename, tableowner
          FROM pg_tables
          WHERE schemaname = 'public'
          ORDER BY tablename
        `);
        console.log(`📋 Tablas disponibles en schema 'public':`);
        allTables.forEach((table: any) => {
          console.log(`  - ${table.tablename} (owner: ${table.tableowner})`);
        });
      }
    } finally {
      await queryRunner.release();
    }

  } catch (error) {
    console.error("❌ Error conectando TypeORM a PostgreSQL:", error);
    throw error;
  }
};
