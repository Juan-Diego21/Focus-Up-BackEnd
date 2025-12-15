"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionesPreferenciasController = void 0;
const NotificacionesPreferenciasService_1 = require("../services/NotificacionesPreferenciasService");
class NotificacionesPreferenciasController {
    constructor() {
        this.preferenciasService = NotificacionesPreferenciasService_1.NotificacionesPreferenciasService;
    }
    async getPreferencias(req, res) {
        try {
            const { idUsuario } = req.params;
            const userId = parseInt(idUsuario, 10);
            if (req.user.userId !== userId) {
                res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para acceder a estas preferencias'
                });
                return;
            }
            const result = await this.preferenciasService.getPreferenciasByUsuario(userId);
            if (!result.success) {
                res.status(400).json(result);
                return;
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
    }
    async updatePreferencias(req, res) {
        try {
            const { idUsuario } = req.params;
            const userId = parseInt(idUsuario, 10);
            const data = req.body;
            if (req.user.userId !== userId) {
                res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para modificar estas preferencias'
                });
                return;
            }
            const result = await this.preferenciasService.updatePreferencias(userId, data);
            if (!result.success) {
                res.status(400).json(result);
                return;
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
}
exports.NotificacionesPreferenciasController = NotificacionesPreferenciasController;
