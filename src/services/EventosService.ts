import { EventoRepository } from '../repositories/EventoRepository';
import { IEventoCreate, IEventoUpdate } from '../types/IEventoCreate';
import { metodoEstudioRepository } from '../repositories/MetodoEstudioRepository';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../models/User.entity';
import { AlbumMusicaEntity } from '../models/AlbumMusica.entity';
import { MetodoEstudioEntity } from '../models/MetodoEstudio.entity';

// Repositorios adicionales para validaciones
const userRepository = AppDataSource.getRepository(UserEntity);
const albumRepository = AppDataSource.getRepository(AlbumMusicaEntity);

/**
 * Servicio para la gestión de eventos de estudio
 * Maneja operaciones CRUD de eventos asociados a métodos de estudio
 */
export const EventoService = {
    /**
     * Lista todos los eventos de estudio registrados
     * Retorna eventos con información completa incluyendo IDs de método y álbum
     */
    async listEvento() {
        try {
            const eventos = await EventoRepository.find({
                relations: ['metodoEstudio', 'album', 'usuario']
            });

            // Mapear para incluir IDs de método y álbum en el nivel superior
            const eventosMapeados = eventos.map(evento => ({
                idEvento: evento.idEvento,
                nombreEvento: evento.nombreEvento,
                fechaEvento: evento.fechaEvento,
                horaEvento: evento.horaEvento,
                descripcionEvento: evento.descripcionEvento,
                idUsuario: evento.usuario?.idUsuario,
                idMetodo: evento.metodoEstudio?.idMetodo,
                idAlbum: evento.album?.idAlbum,
                fechaCreacion: evento.fechaCreacion,
                fechaActualizacion: evento.fechaActualizacion
            }));

            return {
                success: true,
                data: eventosMapeados
            };
        } catch (error) {
            console.error('Error al traer los eventos', error);
            return { success: false, error: 'Error al traer eventos' };
        }
    },
    /**
     * Crea un nuevo evento de estudio
     * Valida que el usuario, método de estudio y álbum (si se proporciona) existan antes de crear el evento
     * Recibe todos los datos necesarios incluyendo relaciones con usuario, método y álbum opcional
     */
    async crearEvento(data: IEventoCreate) {
        try {
            // Validar que el usuario existe
            const usuario = await userRepository.findOne({ where: { idUsuario: data.idUsuario } });
            if (!usuario) {
                return {
                    success: false,
                    error: 'Usuario no válido'
                };
            }

            // Validar que el método de estudio existe si se proporciona
            if (data.idMetodo) {
                const metodoExists = await metodoEstudioRepository.findById(data.idMetodo);
                if (!metodoExists) {
                    return {
                        success: false,
                        error: 'Método de estudio no válido'
                    };
                }
            }

            // Validar que el álbum existe si se proporciona
            if (data.idAlbum) {
                const albumExists = await albumRepository.findOne({ where: { idAlbum: data.idAlbum } });
                if (!albumExists) {
                    return {
                        success: false,
                        error: 'Álbum de música no válido'
                    };
                }
            }

            // Crear el evento con las relaciones
            const nuevoEvento = EventoRepository.create({
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento,
                usuario: usuario,
                metodoEstudio: data.idMetodo ? { idMetodo: data.idMetodo } as any : undefined,
                album: data.idAlbum ? { idAlbum: data.idAlbum } as any : undefined
            });

            const guardarEvento = await EventoRepository.save(nuevoEvento);

            // Mapear respuesta para incluir IDs
            const eventoMapeado = {
                idEvento: guardarEvento.idEvento,
                nombreEvento: guardarEvento.nombreEvento,
                fechaEvento: guardarEvento.fechaEvento,
                horaEvento: guardarEvento.horaEvento,
                descripcionEvento: guardarEvento.descripcionEvento,
                idUsuario: guardarEvento.usuario?.idUsuario,
                idMetodo: guardarEvento.metodoEstudio?.idMetodo,
                idAlbum: guardarEvento.album?.idAlbum,
                fechaCreacion: guardarEvento.fechaCreacion,
                fechaActualizacion: guardarEvento.fechaActualizacion
            };

            return {
                success: true,
                message: "Evento creado correctamente",
                data: eventoMapeado
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
     * Permite modificar nombre, fecha, hora, descripción, método de estudio y álbum del evento
     * Valida las relaciones antes de actualizar si se proporcionan
     */
    async updateEvento(id: number, data: IEventoUpdate) {
        try {
            const evento = await EventoRepository.findOne({
                where: { idEvento: id },
                relations: ['usuario', 'metodoEstudio', 'album']
            });

            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }

            // Preparar datos de actualización
            const updateData: any = {};

            if (data.nombreEvento !== undefined) updateData.nombreEvento = data.nombreEvento;
            if (data.fechaEvento !== undefined) updateData.fechaEvento = data.fechaEvento;
            if (data.horaEvento !== undefined) updateData.horaEvento = data.horaEvento;
            if (data.descripcionEvento !== undefined) updateData.descripcionEvento = data.descripcionEvento;

            // Validar y actualizar método de estudio si se proporciona
            if (data.idMetodo !== undefined) {
                const metodo = await metodoEstudioRepository.findById(data.idMetodo);
                if (!metodo) {
                    return {
                        success: false,
                        error: 'Método de estudio no válido'
                    };
                }
                updateData.metodoEstudio = metodo;
            }

            // Validar y actualizar álbum si se proporciona
            if (data.idAlbum !== undefined) {
                if (data.idAlbum === null) {
                    updateData.album = null;
                } else {
                    const album = await albumRepository.findOne({ where: { idAlbum: data.idAlbum } });
                    if (!album) {
                        return {
                            success: false,
                            error: 'Álbum de música no válido'
                        };
                    }
                    updateData.album = album;
                }
            }

            await EventoRepository.update(id, updateData);

            const eventoActualizado = await EventoRepository.findOne({
                where: { idEvento: id },
                relations: ['usuario', 'metodoEstudio', 'album']
            });

            // Mapear respuesta para incluir IDs
            const eventoMapeado = eventoActualizado ? {
                idEvento: eventoActualizado.idEvento,
                nombreEvento: eventoActualizado.nombreEvento,
                fechaEvento: eventoActualizado.fechaEvento,
                horaEvento: eventoActualizado.horaEvento,
                descripcionEvento: eventoActualizado.descripcionEvento,
                idUsuario: eventoActualizado.usuario?.idUsuario,
                idMetodo: eventoActualizado.metodoEstudio?.idMetodo,
                idAlbum: eventoActualizado.album?.idAlbum,
                fechaCreacion: eventoActualizado.fechaCreacion,
                fechaActualizacion: eventoActualizado.fechaActualizacion
            } : null;

            return {
                success: true,
                message: "Evento actualizado correctamente",
                data: eventoMapeado
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
