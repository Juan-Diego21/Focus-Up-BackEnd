import { EventoRepository, findEventosByUsuario } from '../repositories/EventoRepository';
import { IEventoCreate, IEventoUpdate } from '../types/IEventoCreate';
import { metodoEstudioRepository } from '../repositories/MetodoEstudioRepository';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../models/User.entity';
import { AlbumMusicaEntity } from '../models/AlbumMusica.entity';
import { MetodoEstudioEntity } from '../models/MetodoEstudio.entity';
import { EventoEntity } from '../models/Evento.entity';

// Repositorios adicionales para validaciones
const userRepository = AppDataSource.getRepository(UserEntity);
const albumRepository = AppDataSource.getRepository(AlbumMusicaEntity);

/**
 * Servicio para la gestión de eventos de estudio
 * Maneja operaciones CRUD de eventos asociados a métodos de estudio
 */
export const EventoService = {
    /**
     * Lista los eventos de estudio pertenecientes al usuario autenticado
     * Implementa filtrado seguro por usuario para proteger la privacidad de los datos
     * Solo retorna eventos creados por el usuario que realiza la solicitud
     */
    async getEventosByUsuario(userId: number) {
        try {
            // Validar que el ID de usuario existe y es válido
            if (!userId || userId <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido'
                };
            }

            // Obtener eventos filtrados por usuario desde el repositorio
            // La consulta SQL se ejecuta con parámetro seguro: WHERE id_usuario = $1
            const eventos = await findEventosByUsuario(userId);

            // Mapear respuesta para incluir IDs de método y álbum en el nivel superior
            // Esto asegura consistencia en el formato de respuesta
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
            console.error('Error al obtener eventos del usuario:', error);
            return {
                success: false,
                error: 'Error interno al obtener eventos'
            };
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

            // Cargar entidades relacionadas si se proporcionan
            let metodoEntity: MetodoEstudioEntity | null = null;
            if (data.idMetodo) {
                metodoEntity = await AppDataSource.getRepository(MetodoEstudioEntity).findOne({
                    where: { idMetodo: data.idMetodo }
                });
                if (!metodoEntity) {
                    return {
                        success: false,
                        error: 'Método de estudio no válido'
                    };
                }
            }

            let albumEntity: AlbumMusicaEntity | null = null;
            if (data.idAlbum) {
                albumEntity = await AppDataSource.getRepository(AlbumMusicaEntity).findOne({
                    where: { idAlbum: data.idAlbum }
                });
                if (!albumEntity) {
                    return {
                        success: false,
                        error: 'Álbum de música no válido'
                    };
                }
            }

            // Crear el evento con las entidades relacionadas
            const nuevoEvento = EventoRepository.create({
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento,
                usuario: usuario,
                metodoEstudio: metodoEntity,
                album: albumEntity
            } as Partial<EventoEntity>);

            const guardarEvento = await EventoRepository.save(nuevoEvento);

            // Recargar el evento con relaciones para asegurar datos completos
            const eventoCompleto = await EventoRepository.findOne({
                where: { idEvento: (guardarEvento as any).idEvento },
                relations: ['usuario', 'metodoEstudio', 'album']
            });

            if (!eventoCompleto) {
                throw new Error('Error al recuperar el evento creado');
            }

            // Mapear respuesta para incluir IDs
            const eventoMapeado = {
                idEvento: eventoCompleto.idEvento,
                nombreEvento: eventoCompleto.nombreEvento,
                fechaEvento: eventoCompleto.fechaEvento,
                horaEvento: eventoCompleto.horaEvento,
                descripcionEvento: eventoCompleto.descripcionEvento,
                idUsuario: eventoCompleto.usuario?.idUsuario,
                idMetodo: eventoCompleto.metodoEstudio?.idMetodo,
                idAlbum: eventoCompleto.album?.idAlbum,
                fechaCreacion: eventoCompleto.fechaCreacion,
                fechaActualizacion: eventoCompleto.fechaActualizacion
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
     * Verifica que el evento pertenezca al usuario antes de eliminarlo
     * Operación destructiva que requiere validación de propiedad y existencia
     */
    async deleteEvento(id_evento: number, userId: number) {
        try {
            const evento = await EventoRepository.findOne({
                where: { idEvento: id_evento },
                relations: ['usuario']
            });

            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }

            // Verificar que el evento pertenece al usuario autenticado
            if (evento.usuario?.idUsuario !== userId) {
                return {
                    success: false,
                    error: "No tienes permisos para eliminar este evento"
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
     * Valida que el evento pertenezca al usuario y las relaciones antes de actualizar
     */
    async updateEvento(id: number, userId: number, data: IEventoUpdate) {
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

            // Verificar que el evento pertenece al usuario autenticado
            if (evento.usuario?.idUsuario !== userId) {
                return {
                    success: false,
                    error: "No tienes permisos para modificar este evento"
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

            if (!eventoActualizado) {
                return {
                    success: false,
                    error: "Error al recuperar el evento actualizado"
                };
            }

            // Mapear respuesta para incluir IDs
            const eventoMapeado = {
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
            };

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
