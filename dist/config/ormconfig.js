"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
const logger_1 = __importDefault(require("../utils/logger"));
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
    if (exports.AppDataSource.isInitialized) {
        return;
    }
    try {
        await exports.AppDataSource.initialize();
        logger_1.default.info("TypeORM conectado a PostgreSQL correctamente", {
            host: env_1.env.PGHOST,
            database: env_1.env.PGDATABASE,
            user: env_1.env.PGUSER,
            sslMode: env_1.env.PGSSLMODE,
            entities: exports.AppDataSource.entityMetadatas.length,
        });
    }
    catch (error) {
        logger_1.default.error("Error conectando TypeORM a PostgreSQL", { error });
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
