"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventoService = void 0;
const EventoRepository_1 = require("../repositories/EventoRepository");
const MetodoEstudioRepository_1 = require("../repositories/MetodoEstudioRepository");
exports.EventoService = {
    async listEvento() {
        try {
            const eventist = await EventoRepository_1.EventoRepository.find();
            if (!eventist) {
                return { success: false, data: eventist };
            }
        }
        catch (error) {
            console.error('Error al traer los eventos', error);
            return { success: false, error: 'Error al traer eventos' };
        }
    },
    async crearEvento(data, idMetodo) {
        try {
            console.log("Creando los eventos con :", data);
            const metodo = await MetodoEstudioRepository_1.MetodoEstudioRepository.findOneBy({ idMetodo: idMetodo });
            if (!metodo) {
                return { success: false,
                    error: 'Metodo de estudio no valido'
                };
            }
            const nuevoEvento = EventoRepository_1.EventoRepository.create({
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento,
                metodoEstudio: metodo
            });
            const guardarEvento = await EventoRepository_1.EventoRepository.save(nuevoEvento);
            return {
                success: true,
                message: "Evento creado correcramente ",
                data: guardarEvento
            };
        }
        catch (error) {
            console.log('error al crear el evento', error);
            return {
                success: false,
                error: 'error interno al crear evento'
            };
        }
    },
    async deleteEvento(id_evento) {
        try {
            const evento = await EventoRepository_1.EventoRepository.findOneBy({ idEvento: id_evento });
            if (!evento) {
                return { success: false,
                    error: "Evento no encontrado",
                };
            }
            await EventoRepository_1.EventoRepository.remove(evento);
            return { success: true,
                message: "Evento eliminado correctamente",
            };
        }
        catch (error) {
            console.error("Error al eliminar evento:", error);
            return {
                success: false,
                error: "Error interno al eliminar evento",
            };
        }
    },
    async updateEvento(id, data) {
        try {
            const evento = await EventoRepository_1.EventoRepository.findOneBy({ idEvento: id });
            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado",
                    timestamp: new Date()
                };
            }
            await EventoRepository_1.EventoRepository.update(evento, {
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento
            });
            const eventoActualizado = await EventoRepository_1.EventoRepository.findOneBy(evento);
            return {
                success: true,
                message: "Evento actualizado correctamente",
                data: eventoActualizado,
            };
        }
        catch (error) {
            console.error("Error al actualizar evento:", error);
            return {
                success: false,
                error: "Error interno al actualizar evento",
            };
        }
    }
};
