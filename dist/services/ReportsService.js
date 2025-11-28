"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = exports.ReportsService = void 0;
const ormconfig_1 = require("../config/ormconfig");
const MetodoRealizado_entity_1 = require("../models/MetodoRealizado.entity");
const SesionConcentracion_entity_1 = require("../models/SesionConcentracion.entity");
const User_entity_1 = require("../models/User.entity");
const MetodoEstudio_entity_1 = require("../models/MetodoEstudio.entity");
const Musica_entity_1 = require("../models/Musica.entity");
const NotificacionesProgramadasService_1 = require("./NotificacionesProgramadasService");
const logger_1 = __importDefault(require("../utils/logger"));
const { studyMethodRegistry, methodAliases } = require("../config/methods.config");
function normalizeProgress(progress) {
    if (typeof progress === 'number') {
        return progress;
    }
    if (typeof progress === 'string') {
        const trimmed = progress.trim();
        const parsed = Number(trimmed);
        if (isNaN(parsed)) {
            throw new Error(`Progreso inválido: no se puede convertir "${progress}" a número`);
        }
        if (!Number.isInteger(parsed)) {
            throw new Error(`Progreso inválido: debe ser un número entero, recibido ${parsed}`);
        }
        return parsed;
    }
    throw new Error(`Progreso inválido: tipo de dato no soportado ${typeof progress}`);
}
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
    let methodSlug = methodAliases[nombreMetodo];
    if (methodSlug && studyMethodRegistry[methodSlug]) {
        return methodSlug;
    }
    methodSlug = methodAliases[normalized];
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
    logger_1.default.debug(`Registry config for ${methodType}: ${JSON.stringify({
        validCreationProgress: config.validCreationProgress,
        validUpdateProgress: config.validUpdateProgress,
        validResumeProgress: config.validResumeProgress,
        statusMap: config.statusMap
    })}`);
    return config;
}
function isValidProgressForCreation(methodType, progress) {
    const config = getMethodConfig(methodType);
    let normalizedProgress;
    try {
        normalizedProgress = normalizeProgress(progress);
    }
    catch (error) {
        logger_1.default.warn(`Error normalizing progress for ${methodType} creation: ${error.message}`);
        return false;
    }
    return config.validCreationProgress.includes(normalizedProgress);
}
function isValidProgressForUpdate(methodType, progress) {
    const config = getMethodConfig(methodType);
    let normalizedProgress;
    try {
        normalizedProgress = normalizeProgress(progress);
    }
    catch (error) {
        logger_1.default.warn(`Error normalizing progress for ${methodType}: ${error.message}`);
        return false;
    }
    logger_1.default.debug(`Progress validation for ${methodType}: received=${progress}, normalized=${normalizedProgress}, allowed=${JSON.stringify(config.validUpdateProgress)}, isValid=${config.validUpdateProgress.includes(normalizedProgress)}`);
    return config.validUpdateProgress.includes(normalizedProgress);
}
function isValidProgressForResume(methodType, progress) {
    const config = getMethodConfig(methodType);
    let normalizedProgress;
    try {
        normalizedProgress = normalizeProgress(progress);
    }
    catch (error) {
        logger_1.default.warn(`Error normalizing progress for ${methodType} resume: ${error.message}`);
        return false;
    }
    return config.validResumeProgress.includes(normalizedProgress);
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
        this.sesionRepository = ormconfig_1.AppDataSource.getRepository(SesionConcentracion_entity_1.SesionConcentracionEntity);
        this.userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
        this.metodoRepository = ormconfig_1.AppDataSource.getRepository(MetodoEstudio_entity_1.MetodoEstudioEntity);
        this.musicaRepository = ormconfig_1.AppDataSource.getRepository(Musica_entity_1.MusicaEntity);
    }
    getResumeInfo(methodType, progress) {
        return getResumeInfo(methodType, progress);
    }
    async getUserSessionReports(userId) {
        try {
            const numericUserId = Number(userId);
            logger_1.default.info("Buscando reportes de sesiones para usuario ID:", numericUserId);
            const user = await this.userRepository.findOne({
                where: { idUsuario: numericUserId }
            });
            if (!user) {
                return {
                    success: false,
                    error: "Usuario no encontrado"
                };
            }
            const sesiones = await this.sesionRepository
                .createQueryBuilder("sesion")
                .leftJoinAndSelect("sesion.album", "album")
                .leftJoinAndSelect("sesion.metodo", "metodo")
                .where("sesion.idUsuario = :userId", { userId: numericUserId })
                .orderBy("sesion.fechaCreacion", "DESC")
                .getMany();
            logger_1.default.info(`Encontradas ${sesiones.length} sesiones para usuario ${numericUserId}`);
            const sessionsFormatted = sesiones.map(sesion => ({
                id_reporte: sesion.idSesion,
                id_sesion: sesion.idSesion,
                id_usuario: sesion.idUsuario,
                nombre_sesion: sesion.titulo || 'Sesión sin título',
                descripcion: sesion.descripcion || '',
                estado: sesion.estado,
                tiempo_total: this.intervalToMs(sesion.tiempoTranscurrido),
                metodo_asociado: sesion.metodo ? {
                    id_metodo: sesion.metodo.idMetodo,
                    nombre_metodo: sesion.metodo.nombreMetodo
                } : null,
                album_asociado: sesion.album ? {
                    id_album: sesion.album.idAlbum,
                    nombre_album: sesion.album.nombreAlbum
                } : null,
                fecha_creacion: sesion.fechaCreacion
            }));
            return {
                success: true,
                sessions: sessionsFormatted
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.getUserSessionReports:", error);
            return {
                success: false,
                error: "Error al obtener reportes de sesiones"
            };
        }
    }
    async getUserMethodReports(userId) {
        try {
            const numericUserId = Number(userId);
            logger_1.default.info("Buscando reportes de métodos para usuario ID:", numericUserId);
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
            const methodsFormatted = metodosRealizados.map(metodoRealizado => ({
                id_reporte: metodoRealizado.idMetodoRealizado,
                id_metodo: metodoRealizado.idMetodo,
                id_usuario: metodoRealizado.idUsuario,
                nombre_metodo: metodoRealizado.metodo?.nombreMetodo || 'Método desconocido',
                progreso: metodoRealizado.progreso,
                estado: metodoRealizado.estado,
                fecha_creacion: metodoRealizado.fechaCreacion
            }));
            return {
                success: true,
                methods: methodsFormatted
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.getUserMethodReports:", error);
            return {
                success: false,
                error: "Error al obtener reportes de métodos"
            };
        }
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
                        const validProgressValues = getMethodConfig(type).validCreationProgress;
                        logger_1.default.warn(JSON.stringify({
                            event: "invalid_progress_creation",
                            method: type,
                            receivedProgress: data.progreso,
                            allowed: validProgressValues
                        }));
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
            let progresoNormalizado = MetodoRealizado_entity_1.MetodoProgreso.INICIADO;
            if (data.progreso !== undefined) {
                try {
                    progresoNormalizado = normalizeProgress(data.progreso);
                }
                catch (error) {
                    return {
                        success: false,
                        error: `Error al normalizar progreso: ${error.message}`
                    };
                }
            }
            const metodoRealizado = this.metodoRealizadoRepository.create({
                idUsuario: data.idUsuario,
                idMetodo: data.idMetodo,
                progreso: progresoNormalizado,
                estado: estadoNormalizado,
                fechaInicio: new Date(),
            });
            const savedMetodo = await this.metodoRealizadoRepository.save(metodoRealizado);
            if (savedMetodo.progreso < MetodoRealizado_entity_1.MetodoProgreso.COMPLETADO) {
                try {
                    const fechaRecordatorio = new Date(savedMetodo.fechaCreacion);
                    fechaRecordatorio.setDate(fechaRecordatorio.getDate() + 7);
                    const ahora = new Date();
                    if (fechaRecordatorio <= ahora) {
                        logger_1.default.warn(`Fecha de recordatorio calculada ${fechaRecordatorio} no está en el futuro para método ${savedMetodo.idMetodoRealizado}`);
                    }
                    else {
                        await NotificacionesProgramadasService_1.NotificacionesProgramadasService.createScheduledNotification({
                            idUsuario: data.idUsuario,
                            tipo: "metodo_pendiente",
                            titulo: "Recordatorio de método pendiente",
                            mensaje: `Aún tienes un método sin finalizar: ${savedMetodo.metodo?.nombreMetodo || 'Método de estudio'}. ¡Continúa con tu aprendizaje!`,
                            fechaProgramada: fechaRecordatorio
                        });
                        logger_1.default.info(`Recordatorio programado para método ${savedMetodo.idMetodoRealizado} del usuario ${data.idUsuario} en ${fechaRecordatorio}`);
                    }
                }
                catch (error) {
                    logger_1.default.error('Error al programar recordatorio automático para método:', error);
                }
            }
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
            const sesiones = await this.sesionRepository
                .createQueryBuilder("sesion")
                .leftJoinAndSelect("sesion.album", "album")
                .where("sesion.idUsuario = :userId", { userId: numericUserId })
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
            const sesionesFormateadas = sesiones.map(sesion => ({
                id: sesion.idSesion,
                album: sesion.album ? {
                    id: sesion.album.idAlbum,
                    nombre: sesion.album.nombreAlbum,
                    genero: sesion.album.genero,
                } : null,
                titulo: sesion.titulo,
                descripcion: sesion.descripcion,
                tipo: sesion.tipo,
                estado: sesion.estado,
                tiempoTranscurrido: sesion.tiempoTranscurrido,
                fechaCreacion: sesion.fechaCreacion,
                fechaActualizacion: sesion.fechaActualizacion,
                ultimaInteraccion: sesion.ultimaInteraccion,
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
                ...sesionesFormateadas.map(sesion => ({
                    id_reporte: sesion.id,
                    id_usuario: numericUserId,
                    nombre_metodo: sesion.titulo ? `Sesión: ${sesion.titulo}` : 'Sesión de concentración',
                    progreso: undefined,
                    estado: sesion.estado,
                    fecha_creacion: sesion.fechaCreacion,
                }))
            ].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
            return {
                success: true,
                reports: {
                    metodos,
                    sesiones: sesionesFormateadas,
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
                    if (!isValidProgressForUpdate(type, data.progreso)) {
                        const validProgressValues = getMethodConfig(type).validUpdateProgress;
                        logger_1.default.warn(JSON.stringify({
                            event: "invalid_progress_update",
                            method: type,
                            receivedProgress: data.progreso,
                            allowed: validProgressValues,
                            methodId: numericMethodId
                        }));
                        return {
                            success: false,
                            message: `Progreso inválido para actualización: received=${data.progreso}, allowed=${validProgressValues.join(', ')}, method=${type}`
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
                try {
                    metodoRealizado.progreso = normalizeProgress(data.progreso);
                }
                catch (error) {
                    return {
                        success: false,
                        error: `Error al normalizar progreso: ${error.message}`
                    };
                }
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
            logger_1.default.info(`Actualizando progreso de sesión ${numericSessionId} para usuario ${numericUserId}`, data);
            const result = await ormconfig_1.AppDataSource.transaction(async (transactionalEntityManager) => {
                const session = await transactionalEntityManager
                    .getRepository(SesionConcentracion_entity_1.SesionConcentracionEntity)
                    .findOne({
                    where: { idSesion: numericSessionId, idUsuario: numericUserId },
                    relations: ["evento"]
                });
                if (!session) {
                    throw new Error("Sesión no encontrada o no pertenece al usuario");
                }
                if (data.elapsedMs !== undefined) {
                    const hours = Math.floor(data.elapsedMs / 3600000);
                    const minutes = Math.floor((data.elapsedMs % 3600000) / 60000);
                    const seconds = Math.floor((data.elapsedMs % 60000) / 1000);
                    session.tiempoTranscurrido = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                if (data.status === "completed") {
                    session.estado = "completada";
                    session.ultimaInteraccion = new Date();
                    if (session.evento) {
                        session.evento.estado = "completado";
                        await transactionalEntityManager.save(session.evento);
                        logger_1.default.info(`Evento ${session.evento.idEvento} marcado como completado`);
                    }
                }
                else if (data.status === "pending") {
                    session.estado = "pendiente";
                    session.ultimaInteraccion = new Date();
                }
                const updatedSession = await transactionalEntityManager.save(session);
                logger_1.default.info(`Sesión ${numericSessionId} actualizada exitosamente`, {
                    status: session.estado,
                    elapsedMs: data.elapsedMs,
                    notes: data.notes
                });
                return updatedSession;
            });
            const sessionDto = {
                sessionId: result.idSesion,
                userId: result.idUsuario,
                title: result.titulo,
                description: result.descripcion,
                type: result.tipo,
                status: result.estado,
                eventId: result.idEvento,
                methodId: result.idMetodo,
                albumId: result.idAlbum,
                elapsedInterval: result.tiempoTranscurrido,
                elapsedMs: this.intervalToMs(result.tiempoTranscurrido),
                createdAt: result.fechaCreacion.toISOString(),
                updatedAt: result.fechaActualizacion.toISOString(),
                lastInteractionAt: result.ultimaInteraccion.toISOString(),
            };
            return {
                success: true,
                session: sessionDto,
                message: data.status === "completed" ? "Sesión completada exitosamente" : "Sesión actualizada exitosamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en ReportsService.updateSessionProgress:", error);
            return {
                success: false,
                error: error.message || "Error al actualizar progreso de la sesión"
            };
        }
    }
    intervalToMs(intervalValue) {
        if (typeof intervalValue === 'string') {
            const parts = intervalValue.split(':');
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseInt(parts[2]) || 0;
            return (hours * 3600 + minutes * 60 + seconds) * 1000;
        }
        if (typeof intervalValue === 'object' && intervalValue !== null) {
            const hours = intervalValue.hours || 0;
            const minutes = intervalValue.minutes || 0;
            const seconds = intervalValue.seconds || 0;
            const milliseconds = intervalValue.milliseconds || 0;
            return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
        }
        logger_1.default.warn('No se pudo parsear el intervalo, usando 0', { intervalValue });
        return 0;
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
            const session = await this.sesionRepository
                .createQueryBuilder("sesion")
                .leftJoinAndSelect("sesion.album", "album")
                .where("sesion.idSesion = :sessionId", { sessionId: numericSessionId })
                .andWhere("sesion.idUsuario = :userId", { userId: numericUserId })
                .getOne();
            if (!session) {
                return {
                    success: false,
                    error: "Sesión no encontrada"
                };
            }
            return {
                success: true,
                session
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
            const methodReport = await this.metodoRealizadoRepository
                .createQueryBuilder("mr")
                .where("mr.idMetodoRealizado = :reportId", { reportId: numericReportId })
                .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
                .getOne();
            if (methodReport) {
                logger_1.default.info(`Eliminando reporte de método ${numericReportId} del usuario ${numericUserId}`);
                await this.metodoRealizadoRepository.remove(methodReport);
                logger_1.default.info(`Reporte de método ${numericReportId} eliminado correctamente`);
                return {
                    success: true,
                    message: "Reporte de método eliminado correctamente"
                };
            }
            const sessionReport = await this.sesionRepository
                .createQueryBuilder("sesion")
                .where("sesion.idSesion = :reportId", { reportId: numericReportId })
                .andWhere("sesion.idUsuario = :userId", { userId: numericUserId })
                .getOne();
            if (sessionReport) {
                logger_1.default.info(`Eliminando reporte de sesión ${numericReportId} del usuario ${numericUserId}`);
                await this.sesionRepository.remove(sessionReport);
                logger_1.default.info(`Reporte de sesión ${numericReportId} eliminado correctamente`);
                return {
                    success: true,
                    message: "Reporte de sesión eliminado correctamente"
                };
            }
            logger_1.default.warn(`Reporte ${numericReportId} no encontrado para usuario ${numericUserId} (ni método ni sesión)`);
            return {
                success: false,
                error: "Reporte no encontrado o no autorizado"
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
