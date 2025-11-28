"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EventoController_1 = require("../controllers/EventoController");
const auth_1 = require("../middleware/auth");
const EventosService_1 = require("../services/EventosService");
const router = (0, express_1.Router)();
const eventosControllerExtendido = {
    async marcarComoCompletado(req, res) {
        try {
            const { id } = req.params;
            const idEvento = parseInt(id, 10);
            const userId = req.user.userId;
            const result = await EventosService_1.EventoService.marcarComoCompletado(idEvento, userId);
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error en marcarComoCompletado:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },
    async marcarComoPendiente(req, res) {
        try {
            const { id } = req.params;
            const idEvento = parseInt(id, 10);
            const userId = req.user.userId;
            const result = await EventosService_1.EventoService.marcarComoPendiente(idEvento, userId);
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error en marcarComoPendiente:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },
    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const idEvento = parseInt(id, 10);
            const userId = req.user.userId;
            const { estado } = req.body;
            const validEstados = [null, 'pendiente', 'completado'];
            if (!validEstados.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    error: 'Estado inválido. Debe ser null, "pendiente" o "completado"'
                });
            }
            const result = await EventosService_1.EventoService.actualizarEstado(idEvento, userId, estado);
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error en actualizarEstado:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};
router.get('/', auth_1.authenticateToken, EventoController_1.eventosController.listEventos.bind(EventoController_1.eventosController));
router.post('/crear', auth_1.authenticateToken, EventoController_1.eventosController.crearEvento.bind(EventoController_1.eventosController));
router.put('/:id', auth_1.authenticateToken, EventoController_1.eventosController.updateEvento.bind(EventoController_1.eventosController));
router.delete('/:id', auth_1.authenticateToken, EventoController_1.eventosController.deleteEvento.bind(EventoController_1.eventosController));
router.patch('/:id/completed', auth_1.authenticateToken, eventosControllerExtendido.marcarComoCompletado.bind(eventosControllerExtendido));
router.patch('/:id/pending', auth_1.authenticateToken, eventosControllerExtendido.marcarComoPendiente.bind(eventosControllerExtendido));
router.patch('/:id', auth_1.authenticateToken, eventosControllerExtendido.actualizarEstado.bind(eventosControllerExtendido));
exports.default = router;
