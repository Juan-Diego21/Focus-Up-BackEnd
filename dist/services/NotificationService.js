"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const typeorm_1 = require("typeorm");
const ormconfig_1 = require("../config/ormconfig");
const NotificacionesProgramadas_entity_1 = require("../models/NotificacionesProgramadas.entity");
const User_entity_1 = require("../models/User.entity");
const SesionConcentracion_entity_1 = require("../models/SesionConcentracion.entity");
const NotificacionesUsuario_entity_1 = require("../models/NotificacionesUsuario.entity");
const logger_1 = __importDefault(require("../utils/logger"));
class NotificationService {
    constructor() {
        this.notificationRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesProgramadas_entity_1.NotificacionesProgramadasEntity);
        this.userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
        this.sessionRepository = ormconfig_1.AppDataSource.getRepository(SesionConcentracion_entity_1.SesionConcentracionEntity);
        this.preferencesRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesUsuario_entity_1.NotificacionesUsuarioEntity);
    }
    buildWeekBounds(referenceDate) {
        const weekStart = new Date(referenceDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return { weekStart, weekEnd };
    }
    async findWeeklyDuplicate(userId, sessionId, scheduledAt) {
        const { weekStart, weekEnd } = this.buildWeekBounds(scheduledAt);
        const compactPattern = `%"sessionId":${sessionId}%`;
        const spacedPattern = `%"sessionId": ${sessionId}%`;
        return this.notificationRepository
            .createQueryBuilder("n")
            .where("n.idUsuario = :userId", { userId })
            .andWhere("n.tipo = :tipo", { tipo: "sesion_pendiente" })
            .andWhere("n.enviada = false")
            .andWhere("n.fechaProgramada BETWEEN :weekStart AND :weekEnd", {
            weekStart,
            weekEnd,
        })
            .andWhere("(n.mensaje LIKE :compactPattern OR n.mensaje LIKE :spacedPattern)", { compactPattern, spacedPattern })
            .getOne();
    }
    async createScheduledNotification({ userId, sessionId, title, message, scheduledAt, }) {
        logger_1.default.info(`Creando notificacion programada para usuario ${userId}, sesion ${sessionId}`);
        const [usuario, sesion] = await Promise.all([
            this.userRepository.findOne({ where: { idUsuario: userId } }),
            this.sessionRepository.findOne({
                where: { idSesion: sessionId, idUsuario: userId },
            }),
        ]);
        if (!usuario) {
            return { success: false, error: "Usuario no encontrado" };
        }
        if (!sesion) {
            return {
                success: false,
                error: "Sesion no encontrada o no pertenece al usuario",
            };
        }
        const preferencias = await this.preferencesRepository.findOne({
            where: { idUsuario: userId },
        });
        const sesionesHabilitadas = preferencias?.sesionesPendientes ?? true;
        if (!sesionesHabilitadas) {
            logger_1.default.info(`Notificaciones de sesiones pendientes desactivadas para usuario ${userId}`);
            return {
                success: true,
                skippedByPreference: true,
                message: "Notificacion omitida por preferencia del usuario",
            };
        }
        const existingNotification = await this.findWeeklyDuplicate(userId, sessionId, scheduledAt);
        if (existingNotification) {
            logger_1.default.info(`Notificacion duplicada detectada para usuario ${userId}, sesion ${sessionId}`);
            return {
                success: true,
                duplicated: true,
                data: existingNotification,
                message: "Notificacion ya programada para esta semana",
            };
        }
        const { weekStart } = this.buildWeekBounds(scheduledAt);
        const notification = this.notificationRepository.create({
            idUsuario: userId,
            tipo: "sesion_pendiente",
            titulo: title,
            mensaje: JSON.stringify({
                sessionId,
                message,
                weekStart: weekStart.toISOString(),
            }),
            fechaProgramada: scheduledAt,
            enviada: false,
        });
        const savedNotification = await this.notificationRepository.save(notification);
        logger_1.default.info("Notificacion programada creada exitosamente", {
            notificationId: savedNotification.idNotificacion,
            scheduledAt,
        });
        return {
            success: true,
            data: savedNotification,
            message: "Notificacion programada creada correctamente",
        };
    }
    async checkDuplicateScheduledNotification(sessionId, weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const compactPattern = `%"sessionId":${sessionId}%`;
        const spacedPattern = `%"sessionId": ${sessionId}%`;
        const count = await this.notificationRepository
            .createQueryBuilder("n")
            .where("n.tipo = :tipo", { tipo: "sesion_pendiente" })
            .andWhere("n.enviada = false")
            .andWhere("n.fechaProgramada BETWEEN :weekStart AND :weekEnd", {
            weekStart,
            weekEnd,
        })
            .andWhere("(n.mensaje LIKE :compactPattern OR n.mensaje LIKE :spacedPattern)", { compactPattern, spacedPattern })
            .getCount();
        return count > 0;
    }
    async processPendingNotifications() {
        logger_1.default.info("Procesando notificaciones pendientes de sesiones");
        const now = new Date();
        const pendingNotifications = await this.notificationRepository.find({
            where: {
                enviada: false,
                fechaProgramada: (0, typeorm_1.LessThanOrEqual)(now),
            },
            relations: ["usuario"],
            order: { fechaProgramada: "ASC" },
        });
        logger_1.default.info(`Encontradas ${pendingNotifications.length} notificaciones pendientes`);
        for (const notification of pendingNotifications) {
            try {
                notification.enviada = true;
                notification.fechaEnvio = now;
                await this.notificationRepository.save(notification);
                logger_1.default.info(`Notificacion ${notification.idNotificacion} procesada y marcada como enviada`);
            }
            catch (error) {
                logger_1.default.error(`Error procesando notificacion ${notification.idNotificacion}`, { error });
            }
        }
    }
}
exports.NotificationService = NotificationService;
