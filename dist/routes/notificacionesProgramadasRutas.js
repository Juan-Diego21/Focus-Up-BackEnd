"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const NotificacionesProgramadasService_1 = require("../services/NotificacionesProgramadasService");
const router = (0, express_1.Router)();
const notificacionesProgramadasController = {
    async createScheduledNotification(req, res) {
        try {
            const { idUsuario, tipo, titulo, mensaje, fechaProgramada } = req.body;
            if (req.user.userId !== idUsuario) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para crear notificaciones para este usuario'
                });
            }
            const fechaProgramadaDate = new Date(fechaProgramada);
            if (isNaN(fechaProgramadaDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Fecha programada inválida'
                });
            }
            const result = await NotificacionesProgramadasService_1.NotificacionesProgramadasService.createScheduledNotification({
                idUsuario,
                tipo,
                titulo,
                mensaje,
                fechaProgramada: fechaProgramadaDate
            });
            if (!result.success) {
                return res.status(400).json(result);
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
    },
    async getScheduledNotifications(req, res) {
        try {
            const userId = req.user.userId;
            const result = await NotificacionesProgramadasService_1.NotificacionesProgramadasService.getUpcomingEventsWithNotifications(userId);
            if (!result.success) {
                return res.status(500).json(result);
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
    },
    async markAsSent(req, res) {
        try {
            const { id } = req.params;
            const idNotificacion = parseInt(id, 10);
            if (isNaN(idNotificacion)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de notificación inválido'
                });
            }
            const result = await NotificacionesProgramadasService_1.NotificacionesProgramadasService.markAsSent(idNotificacion);
            if (!result.success) {
                return res.status(400).json(result);
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
};
router.post('/programadas', auth_1.authenticateToken, notificacionesProgramadasController.createScheduledNotification.bind(notificacionesProgramadasController));
router.get('/programadas', auth_1.authenticateToken, notificacionesProgramadasController.getScheduledNotifications.bind(notificacionesProgramadasController));
router.patch('/programadas/:id/enviada', auth_1.authenticateToken, notificacionesProgramadasController.markAsSent.bind(notificacionesProgramadasController));
exports.default = router;
