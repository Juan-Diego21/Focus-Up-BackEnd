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
            const existingActiveMethod = await this.metodoRealizadoRepository.findOne({
                where: {
                    idUsuario: data.idUsuario,
                    estado: MetodoRealizado_entity_1.MetodoEstado.EN_PROGRESO
                }
            });
            if (existingActiveMethod) {
                return {
                    success: false,
                    error: "Ya existe un método activo para este usuario"
                };
            }
            const metodoRealizado = this.metodoRealizadoRepository.create({
                idUsuario: data.idUsuario,
                idMetodo: data.idMetodo,
                progreso: data.progreso !== undefined ? data.progreso : MetodoRealizado_entity_1.MetodoProgreso.INICIADO,
                estado: data.estado ? data.estado : MetodoRealizado_entity_1.MetodoEstado.EN_PROGRESO,
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
                metodoRealizado.progreso = data.progreso;
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
                message: "Progreso del método actualizado exitosamente"
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
            if (data.estado !== undefined) {
                sesionRealizada.estado = data.estado;
            }
            const updatedSesion = await this.sesionRealizadaRepository.save(sesionRealizada);
            return {
                success: true,
                sesionRealizada: updatedSesion,
                message: "Progreso de la sesión actualizado exitosamente"
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
