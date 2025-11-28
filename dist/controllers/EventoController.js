"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventosController = void 0;
const EventosService_1 = require("../services/EventosService");
exports.eventosController = {
    async listEventos(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }
            const eventosUsuario = await EventosService_1.EventoService.getEventosByUsuario(userId);
            if (eventosUsuario?.success) {
                return res.status(200).json(eventosUsuario);
            }
            else {
                return res.status(400).json(eventosUsuario);
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || 'Error interno del servidor'
            });
        }
    },
    async crearEvento(req, res) {
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento, tipoEvento, idMetodo, idAlbum } = req.body;
        const idUsuario = req.user.userId;
        try {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaEvento || !dateRegex.test(fechaEvento)) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                });
            }
            const datos = await EventosService_1.EventoService.crearEvento({
                nombreEvento,
                fechaEvento,
                horaEvento,
                descripcionEvento,
                tipoEvento,
                idUsuario,
                idMetodo,
                idAlbum
            });
            if (datos?.success) {
                return res.status(201).json(datos);
            }
            else {
                return res.status(400).json(datos);
            }
        }
        catch (error) {
            console.error('Error en crearEvento controller:', error);
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },
    async deleteEvento(req, res) {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        try {
            const resultado = await EventosService_1.EventoService.deleteEvento(Number(id), userId);
            if (resultado.success) {
                return res.status(200).json(resultado);
            }
            else {
                return res.status(404).json(resultado);
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || "Error interno al eliminar evento"
            });
        }
    },
    async updateEvento(req, res) {
        const { id } = req.params;
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento, tipoEvento, idMetodo, idAlbum } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        try {
            if (fechaEvento) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(fechaEvento)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                    });
                }
            }
            const datos = await EventosService_1.EventoService.updateEvento(Number(id), userId, {
                nombreEvento,
                fechaEvento,
                horaEvento,
                descripcionEvento,
                tipoEvento,
                idMetodo,
                idAlbum,
            });
            if (datos.success) {
                return res.status(200).json(datos);
            }
            else {
                return res.status(404).json(datos);
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || "Error interno al actualizar evento"
            });
        }
    }
};
