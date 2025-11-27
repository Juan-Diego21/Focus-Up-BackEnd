"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const NotificacionesPreferenciasService_1 = require("../services/NotificacionesPreferenciasService");
const router = (0, express_1.Router)();
const notificacionesController = {
    async getPreferencias(req, res) {
        try {
            const { idUsuario } = req.params;
            const userId = parseInt(idUsuario, 10);
            if (req.user.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para acceder a estas preferencias'
                });
            }
            const result = await NotificacionesPreferenciasService_1.NotificacionesPreferenciasService.getPreferenciasByUsuario(userId);
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error en getPreferencias:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },
    async updatePreferencias(req, res) {
        try {
            const { idUsuario } = req.params;
            const userId = parseInt(idUsuario, 10);
            const data = req.body;
            if (req.user.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para modificar estas preferencias'
                });
            }
            const result = await NotificacionesPreferenciasService_1.NotificacionesPreferenciasService.updatePreferencias(userId, data);
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error en updatePreferencias:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};
router.get('/preferencias/:idUsuario', auth_1.authenticateToken, notificacionesController.getPreferencias.bind(notificacionesController));
router.patch('/preferencias/:idUsuario', auth_1.authenticateToken, notificacionesController.updatePreferencias.bind(notificacionesController));
exports.default = router;
