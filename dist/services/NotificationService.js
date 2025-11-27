"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const ormconfig_1 = require("../config/ormconfig");
const NotificacionesProgramadas_entity_1 = require("../models/NotificacionesProgramadas.entity");
const User_entity_1 = require("../models/User.entity");
const SesionConcentracion_entity_1 = require("../models/SesionConcentracion.entity");
const logger_1 = __importDefault(require("../utils/logger"));
class NotificationService {
    constructor() {
        this.notificationRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesProgramadas_entity_1.NotificacionesProgramadasEntity);
        this.userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
        this.sessionRepository = ormconfig_1.AppDataSource.getRepository(SesionConcentracion_entity_1.SesionConcentracionEntity);
    }
    async createScheduledNotification({ userId, sessionId, title, message, scheduledAt }) {
        logger_1.default.info(`Creando notificación programada para usuario ${userId}, sesión ${sessionId}`);
        const weekStart = new Date(scheduledAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const existingNotification = await this.notificationRepository.findOne({
            where: {
                idUsuario: userId,
                tipo: "sesion_pendiente",
                fechaProgramada: scheduledAt
            }
        });
        if (existingNotification) {
            logger_1.default.info(`Notificación ya existe para usuario ${userId}, sesión ${sessionId} en la semana`);
            return existingNotification;
        }
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
        logger_1.default.info(`Notificación programada creada exitosamente`, {
            notificationId: savedNotification.idNotificacion,
            scheduledAt
        });
        return savedNotification;
    }
    async checkDuplicateScheduledNotification(sessionId, weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const count = await this.notificationRepository.count({
            where: {
                tipo: "sesion_pendiente",
                enviada: false,
                fechaProgramada: weekStart
            }
        });
        return count > 0;
    }
    async processPendingNotifications() {
        logger_1.default.info('Procesando notificaciones pendientes de sesiones');
        const now = new Date();
        const pendingNotifications = await this.notificationRepository.find({
            where: {
                enviada: false,
                fechaProgramada: now
            },
            relations: ['usuario']
        });
        logger_1.default.info(`Encontradas ${pendingNotifications.length} notificaciones pendientes`);
        for (const notification of pendingNotifications) {
            try {
                notification.enviada = true;
                notification.fechaEnvio = now;
                await this.notificationRepository.save(notification);
                logger_1.default.info(`Notificación ${notification.idNotificacion} procesada y marcada como enviada`);
            }
            catch (error) {
                logger_1.default.error(`Error procesando notificación ${notification.idNotificacion}:`, error);
            }
        }
    }
}
exports.NotificationService = NotificationService;
