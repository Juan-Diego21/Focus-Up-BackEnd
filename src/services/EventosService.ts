import { EventoRepository, findEventosByUsuario } from '../repositories/EventoRepository';
import { IEventoCreate, IEventoUpdate } from '../types/IEventoCreate';
import { metodoEstudioRepository } from '../repositories/MetodoEstudioRepository';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../models/User.entity';
import { AlbumMusicaEntity } from '../models/AlbumMusica.entity';
import { MetodoEstudioEntity } from '../models/MetodoEstudio.entity';
import { EventoEntity } from '../models/Evento.entity';
import { NotificacionesUsuarioEntity } from '../models/NotificacionesUsuario.entity';
import { NotificacionesProgramadasService } from './NotificacionesProgramadasService';

// Repositorios adicionales para validaciones
const userRepository = AppDataSource.getRepository(UserEntity);
const albumRepository = AppDataSource.getRepository(AlbumMusicaEntity);
const preferenciasRepository = AppDataSource.getRepository(NotificacionesUsuarioEntity);

const parseLocalDateTime = (dateValue: string | Date, timeValue: string): Date | null => {
  const dateString = dateValue instanceof Date
    ? dateValue.toISOString().split('T')[0]
    : String(dateValue);

  const dateParts = dateString.split('-').map((part) => Number.parseInt(part, 10));
  const timeParts = timeValue.split(':').map((part) => Number.parseInt(part, 10));
  if (dateParts.length !== 3 || timeParts.length < 2) return null;

  const [year, month, day] = dateParts;
  const [hour, minute, second = 0] = timeParts;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  ) {
    return null;
  }

  const localDate = new Date(year, month - 1, day, hour, minute, second, 0);
  return Number.isNaN(localDate.getTime()) ? null : localDate;
};

/**
 * Función para validar el estado del evento
 * Solo permite null, 'pending' o 'completed'
 */
const validarStatus = (status: any): boolean => {
  return status === null || status === 'pendiente' || status === 'completado';
};

/**
 * Función para validar formato de fecha YYYY-MM-DD
 * @param dateString - String de fecha a validar
 * @returns boolean indicando si el formato es válido
 */
const validarFormatoFecha = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dateString);
};

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
            // Para eventos de concentración, incluir información completa del método y álbum
            const eventosMapeados = eventos.map(evento => {
                const baseResponse = {
                    idEvento: evento.idEvento,
                    nombreEvento: evento.nombreEvento,
                    fechaEvento: evento.fechaEvento, // Ya es string YYYY-MM-DD
                    horaEvento: evento.horaEvento,
                    descripcionEvento: evento.descripcionEvento,
                    tipoEvento: evento.tipoEvento,
                    estado: evento.estado,
                    idUsuario: evento.usuario?.idUsuario,
                    idMetodo: evento.metodoEstudio?.idMetodo,
                    idAlbum: evento.album?.idAlbum,
                    fechaCreacion: evento.fechaCreacion,
                    fechaActualizacion: evento.fechaActualizacion
                };

                // Para eventos de concentración, incluir información completa del método y álbum
                if (evento.tipoEvento === 'concentracion') {
                    return {
                        ...baseResponse,
                        metodo: evento.metodoEstudio ? {
                            idMetodo: evento.metodoEstudio.idMetodo,
                            nombreMetodo: evento.metodoEstudio.nombreMetodo,
                            descripcion: evento.metodoEstudio.descripcion
                        } : null,
                        album: evento.album ? {
                            idAlbum: evento.album.idAlbum,
                            nombreAlbum: evento.album.nombreAlbum,
                            descripcion: evento.album.descripcion,
                            genero: evento.album.genero
                        } : null
                    };
                }

                return baseResponse;
            });

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
            // Validar formato de fecha
            if (!data.fechaEvento) {
                return {
                    success: false,
                    error: 'Fecha del evento es requerida'
                };
            }

            // Validar formato de fecha YYYY-MM-DD
            if (!validarFormatoFecha(data.fechaEvento)) {
                return {
                    success: false,
                    error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                };
            }

            // Debug: Log the received date
            console.log('🔍 Fecha original recibida:', data.fechaEvento);

            // Validar formato de hora
            if (!data.horaEvento || !/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(data.horaEvento)) {
                return {
                    success: false,
                    error: 'Formato de hora inválido. Use HH:MM o HH:MM:SS'
                };
            }

            // Validar el estado si se proporciona
            if (data.estado !== undefined && !validarStatus(data.estado)) {
                return {
                    success: false,
                    error: 'Estado inválido. Debe ser null, "pendiente" o "completado"'
                };
            }

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
                fechaEvento: data.fechaEvento, // Usar la fecha como string
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento,
                tipoEvento: data.tipoEvento,
                estado: data.estado || null, // Por defecto null
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

            // Debug: Log the retrieved date
            console.log('🔍 Fecha recuperada de BD:', eventoCompleto.fechaEvento);

            // Sistema de recordatorios automáticos para eventos
            // Regla de negocio: Si el evento es para un día futuro, enviar recordatorio 10 minutos antes
            // Si el evento es para hoy, enviar recordatorio a la hora exacta del evento
            try {
                const preferencias = await preferenciasRepository.findOne({
                    where: { idUsuario: data.idUsuario }
                });
                const eventosHabilitados = preferencias?.eventos ?? true;
                if (!eventosHabilitados) {
                    console.log(`🔕 Notificaciones de eventos desactivadas para usuario ${data.idUsuario}`);
                } else {
                // Combinar fecha y hora del evento de manera segura
                const eventDateTime = parseLocalDateTime(eventoCompleto.fechaEvento, eventoCompleto.horaEvento);

                if (!eventDateTime) {
                    console.error(`Fecha/hora inválida para evento ${eventoCompleto.idEvento}: ${eventoCompleto.fechaEvento}T${eventoCompleto.horaEvento}`);
                } else {
                    // Obtener fecha actual y fecha del evento (solo fecha, sin hora)
                    const ahora = new Date();
                    const hoy = new Date(ahora);
                    hoy.setHours(0, 0, 0, 0);

                    const fechaEvento = new Date(eventoCompleto.fechaEvento + 'T00:00:00');

                    // Calcular tiempo del recordatorio según reglas de negocio
                    let tiempoRecordatorio: Date;

                    if (fechaEvento.getTime() > hoy.getTime()) {
                        // Evento futuro: recordatorio 10 minutos antes
                        tiempoRecordatorio = new Date(eventDateTime.getTime() - 10 * 60 * 1000); // 10 minutos en ms
                        console.log(`📅 Evento futuro ${eventoCompleto.idEvento} - recordatorio 10 min antes: ${tiempoRecordatorio}`);
                    } else {
                        // Evento hoy: recordatorio a la hora exacta
                        tiempoRecordatorio = new Date(eventDateTime);
                        console.log(`📅 Evento hoy ${eventoCompleto.idEvento} - recordatorio a la hora exacta: ${tiempoRecordatorio}`);
                    }

                    // Verificar que el tiempo del recordatorio esté en el futuro
                    if (tiempoRecordatorio <= ahora) {
                        console.warn(`⚠️ Tiempo de recordatorio ${tiempoRecordatorio} ya pasó para evento ${eventoCompleto.idEvento} - no se programa notificación`);
                    } else {
                        // Programar notificación automática
                        console.log(`✅ Programando notificación para evento ${eventoCompleto.idEvento} a las ${tiempoRecordatorio}`);

                        // Para eventos de concentración, incluir enlace especial
                        let mensaje = {
                            nombreEvento: eventoCompleto.nombreEvento,
                            fechaEvento: eventoCompleto.fechaEvento,
                            horaEvento: eventoCompleto.horaEvento,
                            descripcionEvento: eventoCompleto.descripcionEvento
                        };

                        if (eventoCompleto.tipoEvento === 'concentracion') {
                            mensaje = {
                                ...mensaje,
                                link: `http://localhost:5173/start-session?eventId=${eventoCompleto.idEvento}`
                            } as any;
                        }

                        await NotificacionesProgramadasService.createScheduledNotification({
                            idUsuario: data.idUsuario,
                            tipo: "evento",
                            titulo: `Recordatorio: ${eventoCompleto.nombreEvento}`,
                            mensaje: JSON.stringify(mensaje),
                            fechaProgramada: tiempoRecordatorio
                        });
                        console.log(`✅ Notificación programada exitosamente para evento ${eventoCompleto.idEvento}`);
                    }
                }
              }
            } catch (error) {
                // Loggear error pero no fallar la creación del evento
                console.error('❌ Error al programar recordatorio automático para evento:', error);
            }

            // Mapear respuesta para incluir IDs y objetos completos para eventos de concentración
            const baseResponse = {
                idEvento: eventoCompleto.idEvento,
                nombreEvento: eventoCompleto.nombreEvento,
                fechaEvento: eventoCompleto.fechaEvento, // Ya es string YYYY-MM-DD
                horaEvento: eventoCompleto.horaEvento,
                descripcionEvento: eventoCompleto.descripcionEvento,
                tipoEvento: eventoCompleto.tipoEvento,
                estado: eventoCompleto.estado,
                idUsuario: eventoCompleto.usuario?.idUsuario,
                idMetodo: eventoCompleto.metodoEstudio?.idMetodo,
                idAlbum: eventoCompleto.album?.idAlbum,
                fechaCreacion: eventoCompleto.fechaCreacion,
                fechaActualizacion: eventoCompleto.fechaActualizacion
            };

            // Para eventos de concentración, incluir información completa del método y álbum
            const eventoMapeado = eventoCompleto.tipoEvento === 'concentracion' ? {
                ...baseResponse,
                metodo: eventoCompleto.metodoEstudio ? {
                    idMetodo: eventoCompleto.metodoEstudio.idMetodo,
                    nombreMetodo: eventoCompleto.metodoEstudio.nombreMetodo,
                    descripcion: eventoCompleto.metodoEstudio.descripcion
                } : null,
                album: eventoCompleto.album ? {
                    idAlbum: eventoCompleto.album.idAlbum,
                    nombreAlbum: eventoCompleto.album.nombreAlbum,
                    descripcion: eventoCompleto.album.descripcion,
                    genero: eventoCompleto.album.genero
                } : null
            } : baseResponse;

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
            if (data.fechaEvento !== undefined) {
                // Validar formato de fecha antes de actualizar
                if (!validarFormatoFecha(data.fechaEvento)) {
                    return {
                        success: false,
                        error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                    };
                }
                updateData.fechaEvento = data.fechaEvento; // Usar como string
            }
            if (data.horaEvento !== undefined) updateData.horaEvento = data.horaEvento;
            if (data.descripcionEvento !== undefined) updateData.descripcionEvento = data.descripcionEvento;
            if (data.tipoEvento !== undefined) updateData.tipoEvento = data.tipoEvento;
            if (data.estado !== undefined) {
                if (!validarStatus(data.estado)) {
                    return {
                        success: false,
                        error: 'Estado inválido. Debe ser null, "pendiente" o "completado"'
                    };
                }
                updateData.estado = data.estado;
            }

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

            // Mapear respuesta para incluir IDs y objetos completos para eventos de concentración
            const baseResponse = {
                idEvento: eventoActualizado.idEvento,
                nombreEvento: eventoActualizado.nombreEvento,
                fechaEvento: eventoActualizado.fechaEvento, // Ya es string YYYY-MM-DD
                horaEvento: eventoActualizado.horaEvento,
                descripcionEvento: eventoActualizado.descripcionEvento,
                tipoEvento: eventoActualizado.tipoEvento,
                estado: eventoActualizado.estado,
                idUsuario: eventoActualizado.usuario?.idUsuario,
                idMetodo: eventoActualizado.metodoEstudio?.idMetodo,
                idAlbum: eventoActualizado.album?.idAlbum,
                fechaCreacion: eventoActualizado.fechaCreacion,
                fechaActualizacion: eventoActualizado.fechaActualizacion
            };

            // Para eventos de concentración, incluir información completa del método y álbum
            const eventoMapeado = eventoActualizado.tipoEvento === 'concentracion' ? {
                ...baseResponse,
                metodo: eventoActualizado.metodoEstudio ? {
                    idMetodo: eventoActualizado.metodoEstudio.idMetodo,
                    nombreMetodo: eventoActualizado.metodoEstudio.nombreMetodo,
                    descripcion: eventoActualizado.metodoEstudio.descripcion
                } : null,
                album: eventoActualizado.album ? {
                    idAlbum: eventoActualizado.album.idAlbum,
                    nombreAlbum: eventoActualizado.album.nombreAlbum,
                    descripcion: eventoActualizado.album.descripcion,
                    genero: eventoActualizado.album.genero
                } : null
            } : baseResponse;

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
    },
    /**
     * Marca un evento como completado
     * Verifica que el evento pertenezca al usuario antes de actualizar
     */
    async marcarComoCompletado(id: number, userId: number) {
        try {
            console.log(`🔍 Buscando evento ${id} para usuario ${userId}`);
            const evento = await EventoRepository.findOne({
                where: { idEvento: id },
                relations: ['usuario']
            });

            console.log(`📋 Evento encontrado:`, {
                idEvento: evento?.idEvento,
                usuario: evento?.usuario ? {
                    idUsuario: evento.usuario.idUsuario,
                    nombre: evento.usuario.nombreUsuario
                } : null
            });

            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }

            // Verificar que el evento pertenece al usuario autenticado
            const eventOwnerId = evento.usuario?.idUsuario;
            console.log(`🔐 Verificando permisos: eventOwnerId=${eventOwnerId}, userId=${userId}`);

            if (eventOwnerId !== userId) {
                console.log(`❌ Permiso denegado: evento pertenece a ${eventOwnerId}, usuario actual ${userId}`);
                return {
                    success: false,
                    error: "No tienes permisos para modificar este evento"
                };
            }

            console.log(`✅ Permiso concedido, actualizando evento`);

            await EventoRepository.update(id, { estado: 'completado' });

            return {
                success: true,
                message: "Evento marcado como completado"
            };
        } catch (error) {
            console.error("Error al marcar evento como completado:", error);
            return {
                success: false,
                error: "Error interno al marcar evento como completado"
            };
        }
    },
    /**
     * Marca un evento como pendiente
     * Verifica que el evento pertenezca al usuario antes de actualizar
     */
    async marcarComoPendiente(id: number, userId: number) {
        try {
            const evento = await EventoRepository.findOne({
                where: { idEvento: id },
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
                    error: "No tienes permisos para modificar este evento"
                };
            }

            await EventoRepository.update(id, { estado: 'pendiente' });

            return {
                success: true,
                message: "Evento marcado como pendiente"
            };
        } catch (error) {
            console.error("Error al marcar evento como pendiente:", error);
            return {
                success: false,
                error: "Error interno al marcar evento como pendiente"
            };
        }
    },

    /**
     * Actualiza el estado de un evento
     * Permite cambiar el estado a cualquier valor válido: null, 'pending', 'completed'
     */
    async actualizarEstado(id: number, userId: number, estado: 'pendiente' | 'completado' | null) {
        try {
            const evento = await EventoRepository.findOne({
                where: { idEvento: id },
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
                    error: "No tienes permisos para modificar este evento"
                };
            }

            await EventoRepository.update(id, { estado });

            return {
                success: true,
                message: `Estado del evento actualizado a ${estado === null ? 'null' : estado}`
            };
        } catch (error) {
            console.error("Error al actualizar estado del evento:", error);
            return {
                success: false,
                error: "Error interno al actualizar estado del evento"
            };
        }
    }


}
