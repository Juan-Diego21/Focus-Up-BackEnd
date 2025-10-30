"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventosController = void 0;
const EventosService_1 = require("../services/EventosService");
exports.eventosController = {
    async listEventos(req, res) {
        try {
            const listarEventos = await EventosService_1.EventoService.listEvento();
            if (listarEventos?.success) {
                return res.status(200).json(listarEventos);
            }
            else {
                return res.status(404).json(listarEventos);
            }
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },
    async crearEvento(req, res) {
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento, idMetodo } = req.body;
        try {
            const datos = await EventosService_1.EventoService.crearEvento({ nombreEvento, fechaEvento, horaEvento, descripcionEvento }, idMetodo);
            if (datos?.success) {
                return res.status(201).json(datos);
            }
            else {
                return res.status(404).json(datos);
            }
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },
    async deleteEvento(req, res) {
        const { id } = req.params;
        try {
            const resultado = await EventosService_1.EventoService.deleteEvento(Number(id));
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
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento } = req.body;
        try {
            const datos = await EventosService_1.EventoService.updateEvento(Number(id), {
                nombreEvento,
                fechaEvento,
                horaEvento,
                descripcionEvento,
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
