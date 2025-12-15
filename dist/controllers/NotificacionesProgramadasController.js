"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionesProgramadasController = void 0;
const NotificacionesProgramadasService_1 = require("../services/NotificacionesProgramadasService");
class NotificacionesProgramadasController {
    constructor() {
        this.notificacionesService = NotificacionesProgramadasService_1.NotificacionesProgramadasService;
    }
    async createScheduledNotification(req, res) {
        try {
            const { idUsuario, tipo, titulo, mensaje, fechaProgramada } = req.body;
            if (req.user.userId !== idUsuario) {
                res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para crear notificaciones para este usuario'
                });
                return;
            }
            const fechaProgramadaDate = new Date(fechaProgramada);
            if (isNaN(fechaProgramadaDate.getTime())) {
                res.status(400).json({
                    success: false,
                    error: 'Fecha programada inválida'
                });
                return;
            }
            const result = await this.notificacionesService.createScheduledNotification({
                idUsuario,
                tipo,
                titulo,
                mensaje,
                fechaProgramada: fechaProgramadaDate
            });
            if (!result.success) {
                res.status(400).json(result);
                return;
            }
            res.status(201).json(result);
        }
        catch (error) {
            console.error('Error en createScheduledNotification:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    async getScheduledNotifications(req, res) {
        try {
            const userId = req.user.userId;
            const result = await this.notificacionesService.getUpcomingEventsWithNotifications(userId);
            if (!result.success) {
                res.status(500).json(result);
                return;
            }
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error en getScheduledNotifications:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    async markAsSent(req, res) {
        try {
            const { id } = req.params;
            const idNotificacion = parseInt(id, 10);
            if (isNaN(idNotificacion)) {
                res.status(400).json({
                    success: false,
                    error: 'ID de notificación inválido'
                });
                return;
            }
            const result = await this.notificacionesService.markAsSent(idNotificacion);
            if (!result.success) {
                res.status(400).json(result);
                return;
            }
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error en markAsSent:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}
exports.NotificacionesProgramadasController = NotificacionesProgramadasController;
