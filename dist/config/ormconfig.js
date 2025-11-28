"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
const User_entity_1 = require("../models/User.entity");
const Interest_entity_1 = require("../models/Interest.entity");
const Distraction_entity_1 = require("../models/Distraction.entity");
const UsuarioIntereses_entity_1 = require("../models/UsuarioIntereses.entity");
const UsuarioDistracciones_entity_1 = require("../models/UsuarioDistracciones.entity");
const Beneficio_entity_1 = require("../models/Beneficio.entity");
const MetodoEstudio_entity_1 = require("../models/MetodoEstudio.entity");
const MetodoBeneficios_entity_1 = require("../models/MetodoBeneficios.entity");
const Musica_entity_1 = require("../models/Musica.entity");
const AlbumMusica_entity_1 = require("../models/AlbumMusica.entity");
const Evento_entity_1 = require("../models/Evento.entity");
const PasswordReset_entity_1 = require("../models/PasswordReset.entity");
const MetodoRealizado_entity_1 = require("../models/MetodoRealizado.entity");
const SesionConcentracionRealizada_entity_1 = require("../models/SesionConcentracionRealizada.entity");
const SesionConcentracion_entity_1 = require("../models/SesionConcentracion.entity");
const NotificacionesUsuario_entity_1 = require("../models/NotificacionesUsuario.entity");
const NotificacionesProgramadas_entity_1 = require("../models/NotificacionesProgramadas.entity");
const CodigosVerificacion_entity_1 = require("../models/CodigosVerificacion.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: env_1.env.PGHOST,
    port: env_1.env.PGPORT,
    username: env_1.env.PGUSER,
    password: env_1.env.PGPASSWORD,
    database: env_1.env.PGDATABASE,
    schema: "public",
    ssl: env_1.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: env_1.env.NODE_ENV === "development",
    entities: [
        User_entity_1.UserEntity,
        Interest_entity_1.InterestEntity,
        Distraction_entity_1.DistractionEntity,
        UsuarioIntereses_entity_1.UsuarioInteresesEntity,
        UsuarioDistracciones_entity_1.UsuarioDistraccionesEntity,
        Beneficio_entity_1.BeneficioEntity,
        MetodoEstudio_entity_1.MetodoEstudioEntity,
        MetodoBeneficios_entity_1.MetodoBeneficiosEntity,
        Musica_entity_1.MusicaEntity,
        AlbumMusica_entity_1.AlbumMusicaEntity,
        Evento_entity_1.EventoEntity,
        PasswordReset_entity_1.PasswordResetEntity,
        CodigosVerificacion_entity_1.CodigosVerificacionEntity,
        MetodoRealizado_entity_1.MetodoRealizadoEntity,
        SesionConcentracionRealizada_entity_1.SesionConcentracionRealizadaEntity,
        SesionConcentracion_entity_1.SesionConcentracionEntity,
        NotificacionesUsuario_entity_1.NotificacionesUsuarioEntity,
        NotificacionesProgramadas_entity_1.NotificacionesProgramadasEntity,
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
        console.log(`👤 Conectado como usuario: ${env_1.env.PGUSER}`);
        console.log(`🗄️ Base de datos: ${env_1.env.PGDATABASE}`);
        const entityMetadatas = exports.AppDataSource.entityMetadatas;
        console.log(`📊 Entidades cargadas por TypeORM: ${entityMetadatas.length}`);
        entityMetadatas.forEach(entity => {
            console.log(`  - ${entity.name} -> tabla: ${entity.tableName} (schema: ${entity.schema || 'public'})`);
        });
        const queryRunner = exports.AppDataSource.createQueryRunner();
        try {
            const schemaResult = await queryRunner.query('SELECT current_schema() as schema, current_user as user');
            console.log(`📍 Schema actual: ${schemaResult[0].schema}`);
            console.log(`👤 Usuario de BD: ${schemaResult[0].user}`);
            const tableCheck = await queryRunner.query(`
        SELECT schemaname, tablename, tableowner
        FROM pg_tables
        WHERE tablename = 'usuario'
        AND schemaname = 'public'
      `);
            if (tableCheck.length > 0) {
                console.log(`✅ Tabla 'usuario' encontrada en schema '${tableCheck[0].schemaname}' - Owner: ${tableCheck[0].tableowner}`);
            }
            else {
                console.log(`❌ Tabla 'usuario' NO encontrada en schema 'public'`);
                const allTables = await queryRunner.query(`
          SELECT schemaname, tablename, tableowner
          FROM pg_tables
          WHERE schemaname = 'public'
          ORDER BY tablename
        `);
                console.log(`📋 Tablas disponibles en schema 'public':`);
                allTables.forEach((table) => {
                    console.log(`  - ${table.tablename} (owner: ${table.tableowner})`);
                });
            }
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        console.error("❌ Error conectando TypeORM a PostgreSQL:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
