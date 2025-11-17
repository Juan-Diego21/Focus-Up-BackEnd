"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = exports.ReportsService = void 0;
const ormconfig_1 = require("../config/ormconfig");
const MetodoRealizado_entity_1 = require("../models/MetodoRealizado.entity");
const SesionConcentracionRealizada_entity_1 = require("../models/SesionConcentracionRealizada.entity");
const User_entity_1 = require("../models/User.entity");
const MetodoEstudio_entity_1 = require("../models/MetodoEstudio.entity");
const Musica_entity_1 = require("../models/Musica.entity");
const logger_1 = __importDefault(require("../utils/logger"));
const METHODS_CONFIG = {
    pomodoro: {
        name: "pomodoro",
        aliases: [
            'pomodoro',
            'metodo pomodoro',
            'método pomodoro',
            'pomodoro technique'
        ],
        validProgress: [0, 20, 40, 50, 60, 80, 100],
        states: {
            'en_progreso': { canonical: 'in_progress', dbValue: 'en_progreso' },
            'completado': { canonical: 'completed', dbValue: 'completado' },
            'in_progress': { canonical: 'in_progress', dbValue: 'en_progreso' },
            'completed': { canonical: 'completed', dbValue: 'completado' }
        },
        progressToStateMapping: {
            0: 'en_progreso',
            20: 'en_progreso',
            40: 'en_progreso',
            50: 'en_progreso',
            60: 'en_progreso',
            80: 'en_progreso',
            100: 'completado'
        }
    },
    mindmaps: {
        name: "mindmaps",
        aliases: [
            'mapas mentales',
            'mapa mental',
            'mind maps',
            'mind map',
            'método mapas mentales',
            'repaso espaciado',
            'spaced repetition'
        ],
        validProgress: [20, 40, 60, 80, 100],
        states: {
            'en_proceso': { canonical: 'in_process', dbValue: 'En_proceso' },
            'casi_terminando': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
            'terminado': { canonical: 'done', dbValue: 'Terminado' },
            'in_process': { canonical: 'in_process', dbValue: 'En_proceso' },
            'almost_done': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
            'done': { canonical: 'done', dbValue: 'Terminado' }
        },
        progressToStateMapping: {
            20: 'en_proceso',
            40: 'en_proceso',
            60: 'casi_terminando',
            80: 'casi_terminando',
            100: 'terminado'
        }
    },
    practica_activa: {
        name: "practica_activa",
        aliases: [
            'práctica activa',
            'practica activa',
            'práctica_activa',
            'practica_activa',
            'método práctica activa',
            'metodo practica activa'
        ],
        validProgress: [0, 20, 40, 50, 60, 80, 100],
        states: {
            'en_proceso': { canonical: 'in_process', dbValue: 'En_proceso' },
            'casi_terminando': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
            'terminado': { canonical: 'done', dbValue: 'Terminado' },
            'en_progreso': { canonical: 'in_progress', dbValue: 'en_progreso' },
            'completado': { canonical: 'completed', dbValue: 'completado' },
            'in_process': { canonical: 'in_process', dbValue: 'En_proceso' },
            'almost_done': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
            'done': { canonical: 'done', dbValue: 'Terminado' },
            'in_progress': { canonical: 'in_progress', dbValue: 'en_progreso' },
            'completed': { canonical: 'completed', dbValue: 'completado' }
        },
        progressToStateMapping: {
            0: 'en_progreso',
            20: 'en_progreso',
            40: 'en_progreso',
            50: 'en_progreso',
            60: 'en_progreso',
            80: 'en_progreso',
            100: 'completado'
        }
    }
};
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s+/g, '_');
}
function getMethodType(nombreMetodo) {
    const normalized = normalizeText(nombreMetodo);
    for (const [methodKey, config] of Object.entries(METHODS_CONFIG)) {
        const normalizedAliases = config.aliases.map(alias => normalizeText(alias));
        if (normalizedAliases.includes(normalized)) {
            return methodKey;
        }
    }
    logger_1.default.warn(`Tipo de método no reconocido: "${nombreMetodo}" (normalizado: "${normalized}")`);
    logger_1.default.warn(`Métodos configurados disponibles: ${Object.keys(METHODS_CONFIG).join(', ')}`);
    throw new Error(`Tipo de método no reconocido: ${nombreMetodo}`);
}
function getMethodConfig(methodType) {
    const config = METHODS_CONFIG[methodType];
    if (!config) {
        logger_1.default.error(`Configuración no encontrada para el método: ${methodType}`);
        throw new Error(`Configuración no encontrada para el método: ${methodType}`);
    }
    return config;
}
function getValidProgress(methodType) {
    const config = getMethodConfig(methodType);
    return config.validProgress;
}
function normalizeStatus(status, methodType) {
    const normalized = normalizeText(status);
    const config = getMethodConfig(methodType);
    const stateConfig = config.states[normalized];
    if (!stateConfig) {
        logger_1.default.warn(`Estado no reconocido para método ${methodType}: "${status}" (normalizado: "${normalized}")`);
        logger_1.default.warn(`Estados válidos para ${methodType}: ${Object.keys(config.states).join(', ')}`);
        throw new Error(`Estado no reconocido para este método: ${status}`);
    }
    logger_1.default.debug(`Estado normalizado: "${status}" → "${stateConfig.canonical}" para método ${methodType}`);
    return stateConfig.canonical;
}
function mapStatusToDB(canonical, methodType) {
    const config = getMethodConfig(methodType);
    for (const stateConfig of Object.values(config.states)) {
        if (stateConfig.canonical === canonical) {
            return stateConfig.dbValue;
        }
    }
    logger_1.default.warn(`No se encontró mapping DB para estado canónico "${canonical}" en método ${methodType}`);
    return canonical;
}
function getStatusForProgress(methodType, progress) {
    const config = getMethodConfig(methodType);
    const normalizedState = config.progressToStateMapping[progress];
    if (!normalizedState) {
        logger_1.default.warn(`No se encontró estado para progreso ${progress} en método ${methodType}`);
        return 'en_progreso';
    }
    return config.states[normalizedState].dbValue;
}
function getValidStatusMethods(methodType) {
    const config = getMethodConfig(methodType);
    return Object.values(config.states).map(state => state.canonical);
}
class ReportsService {
    constructor() {
        this.metodoRealizadoRepository = ormconfig_1.AppDataSource.getRepository(MetodoRealizado_entity_1.MetodoRealizadoEntity);
        this.sesionRealizadaRepository = ormconfig_1.AppDataSource.getRepository(SesionConcentracionRealizada_entity_1.SesionConcentracionRealizadaEntity);
        this.userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
        this.metodoRepository = ormconfig_1.AppDataSource.getRepository(MetodoEstudio_entity_1.MetodoEstudioEntity);
        this.musicaRepository = ormconfig_1.AppDataSource.getRepository(Musica_entity_1.MusicaEntity);
    }
    async createActiveMethod(data) {
        try {
            const user = await this.userRepository.findOne({
                where: { idUsuario: data.idUsuario }
            });
            if (!user) {
                return {
                    success: false,
                    error: "Usuario no encontrado"
                };
            }
            const metodo = await this.metodoRepository.findOne({
                where: { idMetodo: data.idMetodo }
            });
            if (!metodo) {
                return {
                    success: false,
                    error: "Método de estudio no encontrado"
                };
            }
            if (data.progreso !== undefined) {
                try {
                    const type = getMethodType(metodo.nombreMetodo);
                    if (!getValidProgress(type).includes(data.progreso)) {
                        return {
                            success: false,
                            message: "Progreso inválido para este método"
                        };
                    }
                }
                catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            }
            let estadoNormalizado = MetodoRealizado_entity_1.MetodoEstado.EN_PROGRESO;
            try {
                const type = getMethodType(metodo.nombreMetodo);
                if (data.estado) {
                    const canonical = normalizeStatus(data.estado, type);
                    const dbValue = mapStatusToDB(canonical, type);
                    estadoNormalizado = dbValue;
                }
                else if (data.progreso !== undefined) {
                    estadoNormalizado = getStatusForProgress(type, data.progreso);
                }
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const metodoRealizado = this.metodoRealizadoRepository.create({
                idUsuario: data.idUsuario,
                idMetodo: data.idMetodo,
                progreso: data.progreso !== undefined ? data.progreso : MetodoRealizado_entity_1.MetodoProgreso.INICIADO,
                estado: estadoNormalizado,
                fechaInicio: new Date(),
            });
            const savedMetodo = await this.metodoRealizadoRepository.save(metodoRealizado);
            return {
                success: true,
                metodoRealizado: savedMetodo,
                message: "Método activo creado exitosamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.createActiveMethod:", error);
            return {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }
    async getUserReports(userId) {
        try {
            const numericUserId = Number(userId);
            logger_1.default.info("Buscando reportes para usuario ID:", numericUserId);
            const user = await this.userRepository.findOne({
                where: { idUsuario: numericUserId }
            });
            if (!user) {
                return {
                    success: false,
                    error: "Usuario no encontrado"
                };
            }
            const metodosRealizados = await this.metodoRealizadoRepository
                .createQueryBuilder("mr")
                .leftJoinAndSelect("mr.metodo", "m")
                .where("mr.idUsuario = :userId", { userId: numericUserId })
                .orderBy("mr.fechaCreacion", "DESC")
                .getMany();
            logger_1.default.info(`Encontrados ${metodosRealizados.length} métodos realizados para usuario ${numericUserId}`);
            const sesionesRealizadas = await this.sesionRealizadaRepository
                .createQueryBuilder("sesion")
                .leftJoinAndSelect("sesion.musica", "musica")
                .leftJoin("sesion.metodoRealizado", "metodoRealizado")
                .where("sesion.idUsuario = :userId OR metodoRealizado.idUsuario = :userId", { userId: numericUserId })
                .orderBy("sesion.fechaCreacion", "DESC")
                .getMany();
            const metodos = metodosRealizados.map(metodoRealizado => ({
                id: metodoRealizado.idMetodoRealizado,
                metodo: {
                    id: metodoRealizado.metodo?.idMetodo,
                    nombre: metodoRealizado.metodo?.nombreMetodo,
                    descripcion: metodoRealizado.metodo?.descripcion,
                },
                progreso: metodoRealizado.progreso,
                estado: metodoRealizado.estado,
                fechaInicio: metodoRealizado.fechaInicio,
                fechaFin: metodoRealizado.fechaFin,
                fechaCreacion: metodoRealizado.fechaCreacion,
            }));
            const sesiones = sesionesRealizadas.map(sesionRealizada => ({
                id: sesionRealizada.idSesionRealizada,
                musica: sesionRealizada.musica ? {
                    id: sesionRealizada.musica.idCancion,
                    nombre: sesionRealizada.musica.nombreCancion,
                    artista: sesionRealizada.musica.artistaCancion,
                    genero: sesionRealizada.musica.generoCancion,
                } : null,
                duracion: null,
                fechaProgramada: sesionRealizada.fechaProgramada,
                estado: sesionRealizada.estado,
                fechaInicio: null,
                fechaFin: null,
                fechaCreacion: sesionRealizada.fechaCreacion,
            }));
            const combined = [
                ...metodos.map(metodo => ({
                    id_reporte: metodo.id,
                    id_usuario: numericUserId,
                    nombre_metodo: metodo.metodo.nombre || 'Método desconocido',
                    progreso: metodo.progreso,
                    estado: metodo.estado,
                    fecha_creacion: metodo.fechaCreacion,
                })),
                ...sesiones.map(sesion => ({
                    id_reporte: sesion.id,
                    id_usuario: numericUserId,
                    nombre_metodo: sesion.musica ? `Sesión: ${sesion.musica.nombre}` : 'Sesión de concentración',
                    progreso: undefined,
                    estado: sesion.estado,
                    fecha_creacion: sesion.fechaCreacion,
                }))
            ].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
            return {
                success: true,
                reports: {
                    metodos,
                    sesiones,
                    combined
                }
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.getUserReports:", error);
            return {
                success: false,
                error: "Error al obtener reportes"
            };
        }
    }
    async updateMethodProgress(methodId, userId, data) {
        try {
            const numericMethodId = Number(methodId);
            const numericUserId = Number(userId);
            const metodoRealizado = await this.metodoRealizadoRepository
                .createQueryBuilder("mr")
                .leftJoinAndSelect("mr.metodo", "m")
                .where("mr.idMetodoRealizado = :methodId", { methodId: numericMethodId })
                .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
                .getOne();
            if (!metodoRealizado) {
                return {
                    success: false,
                    error: "Método realizado no encontrado"
                };
            }
            if (data.progreso !== undefined) {
                const metodo = metodoRealizado.metodo;
                if (!metodo) {
                    return {
                        success: false,
                        error: "Método de estudio no encontrado"
                    };
                }
                try {
                    const type = getMethodType(metodo.nombreMetodo);
                    if (!getValidProgress(type).includes(data.progreso)) {
                        return {
                            success: false,
                            message: "Progreso inválido para este método"
                        };
                    }
                }
                catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
                metodoRealizado.progreso = data.progreso;
                try {
                    const type = getMethodType(metodo.nombreMetodo);
                    metodoRealizado.estado = getStatusForProgress(type, data.progreso);
                }
                catch (error) {
                    logger_1.default.warn("No se pudo actualizar estado basado en progreso:", error);
                }
            }
            if (data.finalizar || (data.progreso === MetodoRealizado_entity_1.MetodoProgreso.COMPLETADO)) {
                metodoRealizado.estado = MetodoRealizado_entity_1.MetodoEstado.COMPLETADO;
                metodoRealizado.fechaFin = new Date();
                metodoRealizado.progreso = MetodoRealizado_entity_1.MetodoProgreso.COMPLETADO;
            }
            const updatedMetodo = await this.metodoRealizadoRepository.save(metodoRealizado);
            return {
                success: true,
                metodoRealizado: updatedMetodo,
                message: "Progreso actualizado correctamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.updateMethodProgress:", error);
            return {
                success: false,
                error: "Error al actualizar progreso del método"
            };
        }
    }
    async updateSessionProgress(sessionId, userId, data) {
        try {
            const numericSessionId = Number(sessionId);
            const numericUserId = Number(userId);
            const sesionRealizada = await this.sesionRealizadaRepository
                .createQueryBuilder("sesion")
                .leftJoinAndSelect("sesion.metodoRealizado", "metodoRealizado")
                .leftJoinAndSelect("metodoRealizado.metodo", "metodo")
                .where("sesion.idSesionRealizada = :sessionId", { sessionId: numericSessionId })
                .andWhere("(sesion.idUsuario = :userId OR metodoRealizado.idUsuario = :userId)", { userId: numericUserId })
                .getOne();
            if (!sesionRealizada) {
                return {
                    success: false,
                    error: "Sesión realizada no encontrada"
                };
            }
            if (data.estado !== undefined) {
                const metodoRealizado = sesionRealizada.metodoRealizado;
                if (!metodoRealizado || !metodoRealizado.metodo) {
                    return {
                        success: false,
                        error: "Método de estudio no encontrado para la sesión"
                    };
                }
                try {
                    const type = getMethodType(metodoRealizado.metodo.nombreMetodo);
                    const canonical = normalizeStatus(data.estado, type);
                    const dbValue = mapStatusToDB(canonical, type);
                    sesionRealizada.estado = dbValue;
                }
                catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            }
            const updatedSesion = await this.sesionRealizadaRepository.save(sesionRealizada);
            return {
                success: true,
                sesionRealizada: updatedSesion,
                message: "Sesión retomada correctamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.updateSessionProgress:", error);
            return {
                success: false,
                error: "Error al actualizar progreso de la sesión"
            };
        }
    }
    async getMethodById(methodId, userId) {
        try {
            const numericMethodId = Number(methodId);
            const numericUserId = Number(userId);
            const metodoRealizado = await this.metodoRealizadoRepository
                .createQueryBuilder("mr")
                .leftJoinAndSelect("mr.metodo", "m")
                .where("mr.idMetodoRealizado = :methodId", { methodId: numericMethodId })
                .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
                .getOne();
            if (!metodoRealizado) {
                return {
                    success: false,
                    error: "Método realizado no encontrado"
                };
            }
            return {
                success: true,
                metodoRealizado
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.getMethodById:", error);
            return {
                success: false,
                error: "Error al obtener método"
            };
        }
    }
    async getSessionById(sessionId, userId) {
        try {
            const numericSessionId = Number(sessionId);
            const numericUserId = Number(userId);
            const sesionRealizada = await this.sesionRealizadaRepository
                .createQueryBuilder("sesion")
                .leftJoinAndSelect("sesion.musica", "musica")
                .leftJoin("sesion.metodoRealizado", "metodoRealizado")
                .where("sesion.idSesionRealizada = :sessionId", { sessionId: numericSessionId })
                .andWhere("(sesion.idUsuario = :userId OR metodoRealizado.idUsuario = :userId)", { userId: numericUserId })
                .getOne();
            if (!sesionRealizada) {
                return {
                    success: false,
                    error: "Sesión realizada no encontrada"
                };
            }
            return {
                success: true,
                sesionRealizada
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.getSessionById:", error);
            return {
                success: false,
                error: "Error al obtener sesión"
            };
        }
    }
    async deleteReport(reportId, userId) {
        try {
            const numericReportId = Number(reportId);
            const numericUserId = Number(userId);
            logger_1.default.info("Buscando reporte con ID:", numericReportId, "para usuario:", numericUserId);
            const report = await this.metodoRealizadoRepository
                .createQueryBuilder("mr")
                .where("mr.idMetodoRealizado = :reportId", { reportId: numericReportId })
                .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
                .getOne();
            if (!report) {
                logger_1.default.warn(`Reporte ${numericReportId} no encontrado para usuario ${numericUserId}`);
                return {
                    success: false,
                    error: "Reporte no encontrado o no autorizado"
                };
            }
            logger_1.default.info(`Eliminando reporte ${numericReportId} del usuario ${numericUserId}`);
            await this.metodoRealizadoRepository.remove(report);
            logger_1.default.info(`Reporte ${numericReportId} eliminado correctamente`);
            return {
                success: true,
                message: "Reporte eliminado correctamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.deleteReport:", error);
            return {
                success: false,
                error: "Error al eliminar reporte"
            };
        }
    }
}
exports.ReportsService = ReportsService;
exports.reportsService = new ReportsService();
