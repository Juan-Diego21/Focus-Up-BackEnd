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
const { studyMethodRegistry, methodAliases } = require("../config/methods.config");
function normalizeText(text) {
    if (!text || typeof text !== 'string')
        return '';
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}
function getMethodType(nombreMetodo) {
    const normalized = normalizeText(nombreMetodo);
    if (studyMethodRegistry[normalized]) {
        return normalized;
    }
    const methodSlug = methodAliases[normalized];
    if (methodSlug && studyMethodRegistry[methodSlug]) {
        return methodSlug;
    }
    logger_1.default.warn(`Tipo de método no reconocido: "${nombreMetodo}" (normalizado: "${normalized}"). Métodos disponibles: ${Object.keys(studyMethodRegistry).join(', ')}`);
    throw new Error(`Tipo de método no reconocido: ${nombreMetodo}`);
}
function getMethodConfig(methodType) {
    const config = studyMethodRegistry[methodType];
    if (!config) {
        logger_1.default.error(`Configuración no encontrada para el método: ${methodType}. Métodos disponibles: ${Object.keys(studyMethodRegistry).join(', ')}`);
        throw new Error(`Configuración no encontrada para el método: ${methodType}`);
    }
    return config;
}
function isValidProgressForCreation(methodType, progress) {
    const config = getMethodConfig(methodType);
    return config.validCreationProgress.includes(progress);
}
function isValidProgressForUpdate(methodType, progress) {
    const config = getMethodConfig(methodType);
    return config.validUpdateProgress.includes(progress);
}
function isValidProgressForResume(methodType, progress) {
    const config = getMethodConfig(methodType);
    return config.validResumeProgress.includes(progress);
}
function getStatusForProgress(methodType, progress) {
    const config = getMethodConfig(methodType);
    const status = config.statusMap[progress];
    if (!status) {
        logger_1.default.warn(`Estado no encontrado para progreso ${progress} en método ${methodType}. Mapeos disponibles: ${Object.keys(config.statusMap).join(', ')}`);
        return 'en_progreso';
    }
    return status;
}
function validateStatusForProgress(status, methodType, progress) {
    const expectedStatus = getStatusForProgress(methodType, progress);
    const normalizedInput = normalizeText(status);
    const normalizedExpected = normalizeText(expectedStatus);
    logger_1.default.debug(`Status validation: input="${status}" -> normalized="${normalizedInput}", expected="${expectedStatus}" -> normalized="${normalizedExpected}"`);
    const acceptableStatuses = [
        normalizedExpected,
        normalizedExpected.replace(/_/g, ' '),
        normalizedExpected.replace(/_/g, ''),
        normalizedExpected.toUpperCase(),
        normalizedExpected.replace(/_/g, ' ').toUpperCase(),
        expectedStatus,
        expectedStatus.replace(/_/g, ' '),
        expectedStatus.toLowerCase(),
        expectedStatus.toUpperCase(),
    ];
    const uniqueStatuses = [...new Set(acceptableStatuses)];
    const isValid = uniqueStatuses.includes(normalizedInput);
    logger_1.default.debug(`Status validation result: ${isValid ? 'VALID' : 'INVALID'}, accepted variations: [${uniqueStatuses.join(', ')}]`);
    return isValid;
}
function getValidStatusMethods(methodType) {
    const config = getMethodConfig(methodType);
    return [...new Set(Object.values(config.statusMap))];
}
function calculateProgressFromSteps(methodType, completedSteps) {
    const config = getMethodConfig(methodType);
    if (!config.totalSteps) {
        throw new Error(`Método ${methodType} no tiene configuración de pasos`);
    }
    if (completedSteps < 0 || completedSteps > config.totalSteps) {
        throw new Error(`Número de pasos inválido: ${completedSteps}. Debe estar entre 0 y ${config.totalSteps}`);
    }
    return Math.round((completedSteps / config.totalSteps) * 100);
}
function calculateCurrentStepFromProgress(methodType, progress) {
    const config = getMethodConfig(methodType);
    if (!config.totalSteps) {
        return 0;
    }
    return Math.round((progress / 100) * config.totalSteps);
}
function getResumeRoute(methodType, progress) {
    const config = getMethodConfig(methodType);
    if (config.routePrefix) {
        const currentStep = calculateCurrentStepFromProgress(methodType, progress);
        return `${config.routePrefix}?step=${currentStep}&progress=${progress}`;
    }
    return `/metodos/${methodType}/ejecucion?progress=${progress}`;
}
function getResumeInfo(methodType, progress) {
    const config = getMethodConfig(methodType);
    const route = getResumeRoute(methodType, progress);
    const result = {
        route,
        progress,
        methodType
    };
    if (config.totalSteps) {
        result.currentStep = calculateCurrentStepFromProgress(methodType, progress);
    }
    return result;
}
class ReportsService {
    constructor() {
        this.metodoRealizadoRepository = ormconfig_1.AppDataSource.getRepository(MetodoRealizado_entity_1.MetodoRealizadoEntity);
        this.sesionRealizadaRepository = ormconfig_1.AppDataSource.getRepository(SesionConcentracionRealizada_entity_1.SesionConcentracionRealizadaEntity);
        this.userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
        this.metodoRepository = ormconfig_1.AppDataSource.getRepository(MetodoEstudio_entity_1.MetodoEstudioEntity);
        this.musicaRepository = ormconfig_1.AppDataSource.getRepository(Musica_entity_1.MusicaEntity);
    }
    getResumeInfo(methodType, progress) {
        return getResumeInfo(methodType, progress);
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
                    if (!isValidProgressForCreation(type, data.progreso)) {
                        logger_1.default.warn(`Progreso inválido para creación: ${data.progreso}. Valores válidos para ${type}: ${getMethodConfig(type).validCreationProgress.join(', ')}`);
                        return {
                            success: false,
                            message: "Progreso inválido para creación de este método"
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
                    const expectedProgress = data.progreso !== undefined ? data.progreso : 0;
                    if (!validateStatusForProgress(data.estado, type, expectedProgress)) {
                        logger_1.default.warn(`Estado inconsistente: "${data.estado}" para progreso ${expectedProgress} en método ${type}. Estado esperado: "${getStatusForProgress(type, expectedProgress)}"`);
                        return {
                            success: false,
                            message: "Estado no consistente con el progreso para este método"
                        };
                    }
                    estadoNormalizado = getStatusForProgress(type, expectedProgress);
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
            logger_1.default.info(`PATCH /api/v1/reports/methods/${numericMethodId}/progress - User: ${numericUserId}, Body: ${JSON.stringify(data)}`);
            const metodoRealizado = await this.metodoRealizadoRepository
                .createQueryBuilder("mr")
                .leftJoinAndSelect("mr.metodo", "m")
                .where("mr.idMetodoRealizado = :methodId", { methodId: numericMethodId })
                .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
                .getOne();
            if (!metodoRealizado) {
                logger_1.default.warn(`Método realizado no encontrado: id=${numericMethodId}, user=${numericUserId}`);
                return {
                    success: false,
                    error: "Método realizado no encontrado"
                };
            }
            logger_1.default.info(`DB Query Result: methodId=${metodoRealizado.idMetodoRealizado}, currentProgress=${metodoRealizado.progreso}, methodName="${metodoRealizado.metodo?.nombreMetodo}", dbMethodId=${metodoRealizado.idMetodo}`);
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
                    logger_1.default.info(`Method type detected: "${metodo.nombreMetodo}" -> "${type}"`);
                    const validProgressValues = getMethodConfig(type).validUpdateProgress;
                    logger_1.default.info(`Validation check: progress=${data.progreso}, validValues=[${validProgressValues.join(', ')}]`);
                    if (!isValidProgressForUpdate(type, data.progreso)) {
                        logger_1.default.warn(`Progreso inválido para actualización: received=${data.progreso}, allowed=[${validProgressValues.join(', ')}], method=${type}, methodId=${numericMethodId}`);
                        return {
                            success: false,
                            message: `Progreso inválido para actualización: received=${data.progreso}, allowed=[${validProgressValues.join(', ')}], method=${type}`
                        };
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error during method type detection/validation: ${error.message}`);
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
                    logger_1.default.warn(`Error al actualizar estado para método ${numericMethodId}: ${error.message}`);
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
                    const validStatuses = getValidStatusMethods(type);
                    const normalizedStatus = normalizeText(data.estado);
                    if (!validStatuses.some(status => normalizeText(status) === normalizedStatus)) {
                        logger_1.default.warn(`Estado inválido para sesión ${numericSessionId}: "${data.estado}". Estados válidos para ${type}: ${validStatuses.join(', ')}`);
                        return {
                            success: false,
                            message: "Estado inválido para este tipo de método"
                        };
                    }
                    sesionRealizada.estado = data.estado;
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
