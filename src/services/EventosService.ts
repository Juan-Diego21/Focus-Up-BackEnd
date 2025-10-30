import { EventoRepository } from '../repositories/EventoRepository';
import { IEventoCreate } from '../types/IEventoCreate';
import { metodoEstudioRepository } from '../repositories/MetodoEstudioRepository';

/**
 * Servicio para la gestión de eventos de estudio
 * Maneja operaciones CRUD de eventos asociados a métodos de estudio
 */
export const EventoService = {
    /**
     * Lista todos los eventos de estudio registrados
     * Retorna eventos con información completa incluyendo método asociado
     */
    async listEvento() {
        try {
            const eventist = await EventoRepository.find();
            return {
                success: true,
                data: eventist
            };
        } catch (error) {
            console.error('Error al traer los eventos', error);
            return { success: false, error: 'Error al traer eventos' };
        }
    },
    /**
     * Crea un nuevo evento de estudio asociado a un método
     * Valida que el método de estudio exista antes de crear el evento
     */
    async crearEvento(data: IEventoCreate, idMetodo: any) {
        try {
            const metodo = await metodoEstudioRepository.findById(idMetodo);
            if (!metodo) {
                return {
                    success: false,
                    error: 'Método de estudio no válido'
                };
            }

            const nuevoEvento = EventoRepository.create({
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento,
                metodoEstudio: metodo
            });

            const guardarEvento = await EventoRepository.save(nuevoEvento);
            return {
                success: true,
                message: "Evento creado correctamente",
                data: guardarEvento
            };
        } catch (error) {
            console.error('Error al crear el evento', error);
            return {
                success: false,
                error: 'Error interno al crear evento'
            };
        }
    },
    /**
     * Elimina un evento de estudio por su ID
     * Operación destructiva que requiere validación previa
     */
    async deleteEvento(id_evento: number) {
        try {
            const evento = await EventoRepository.findOneBy({ idEvento: id_evento });

            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }

            await EventoRepository.remove(evento);

            return {
                success: true,
                message: "Evento eliminado correctamente"
            };
        } catch (error) {
            console.error("Error al eliminar evento:", error);
            return {
                success: false,
                error: "Error interno al eliminar evento"
            };
        }
    },
    /**
     * Actualiza un evento de estudio existente
     * Permite modificar nombre, fecha, hora y descripción del evento
     */
    async updateEvento(id: number, data: {
        nombreEvento?: string;
        fechaEvento?: Date;
        horaEvento?: string;
        descripcionEvento?: string;
    }) {
        try {
            const evento = await EventoRepository.findOneBy({ idEvento: id });

            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }

            await EventoRepository.update(evento, {
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento
            });

            const eventoActualizado = await EventoRepository.findOneBy(evento);
            return {
                success: true,
                message: "Evento actualizado correctamente",
                data: eventoActualizado
            };
        } catch (error) {
            console.error("Error al actualizar evento:", error);
            return {
                success: false,
                error: "Error interno al actualizar evento"
            };
        }
    }

    
}
