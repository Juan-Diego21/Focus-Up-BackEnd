"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventoService = void 0;
const EventoRepository_1 = require("../repositories/EventoRepository");
const MetodoEstudioRepository_1 = require("../repositories/MetodoEstudioRepository");
const ormconfig_1 = require("../config/ormconfig");
const User_entity_1 = require("../models/User.entity");
const AlbumMusica_entity_1 = require("../models/AlbumMusica.entity");
const MetodoEstudio_entity_1 = require("../models/MetodoEstudio.entity");
const NotificacionesUsuario_entity_1 = require("../models/NotificacionesUsuario.entity");
const NotificacionesProgramadasService_1 = require("./NotificacionesProgramadasService");
const NotificacionesProgramadasRepository_1 = require("../repositories/NotificacionesProgramadasRepository");
const userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
const albumRepository = ormconfig_1.AppDataSource.getRepository(AlbumMusica_entity_1.AlbumMusicaEntity);
const preferenciasRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesUsuario_entity_1.NotificacionesUsuarioEntity);
const EVENT_TIMEZONE_OFFSET_MINUTES = Number.parseInt(process.env.EVENT_TIMEZONE_OFFSET_MINUTES ?? '-300', 10);
const DEV_FRONTEND_URL = 'http://localhost:5173';
const formatYmdFromDate = (dateValue) => {
    const year = dateValue.getUTCFullYear();
    const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getDatePartsInConfiguredTimezone = (date) => {
    const shifted = new Date(date.getTime() + EVENT_TIMEZONE_OFFSET_MINUTES * 60000);
    return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth() + 1,
        day: shifted.getUTCDate(),
    };
};
const parseLocalDateTime = (dateValue, timeValue) => {
    const dateString = dateValue instanceof Date
        ? formatYmdFromDate(dateValue)
        : String(dateValue).split('T')[0];
    const dateParts = dateString.split('-').map((part) => Number.parseInt(part, 10));
    const timeParts = timeValue.split(':').map((part) => Number.parseInt(part, 10));
    if (dateParts.length !== 3 || timeParts.length < 2)
        return null;
    const [year, month, day] = dateParts;
    const [hour, minute, second = 0] = timeParts;
    if (!Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day) ||
        !Number.isFinite(hour) ||
        !Number.isFinite(minute) ||
        !Number.isFinite(second)) {
        return null;
    }
    const utcFromConfiguredTimezone = new Date(Date.UTC(year, month - 1, day, hour, minute, second, 0) -
        EVENT_TIMEZONE_OFFSET_MINUTES * 60000);
    return Number.isNaN(utcFromConfiguredTimezone.getTime()) ? null : utcFromConfiguredTimezone;
};
const validarStatus = (status) => {
    return status === null || status === 'pendiente' || status === 'completado';
};
const validarFormatoFecha = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateString);
};
const getFrontendBaseUrl = () => {
    const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
    if (nodeEnv === 'production') {
        return (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
    }
    return DEV_FRONTEND_URL;
};
const buildConcentrationSessionUrl = (idEvento) => {
    return `${getFrontendBaseUrl()}/start-session?eventId=${idEvento}`;
};
const normalizeEventDescription = (descripcionEvento) => {
    if (typeof descripcionEvento === 'string' && descripcionEvento.trim().length > 0) {
        return descripcionEvento.trim();
    }
    return 'Sin descripción';
};
const shouldScheduleEventReminder = (evento) => {
    return evento.estado === undefined || evento.estado === null || evento.estado === 'pendiente';
};
const calculateReminderTime = (evento) => {
    const eventDateTime = parseLocalDateTime(evento.fechaEvento, evento.horaEvento);
    if (!eventDateTime) {
        console.error(`Fecha/hora inválida para evento ${evento.idEvento}: ${evento.fechaEvento}T${evento.horaEvento}`);
        return null;
    }
    const now = new Date();
    const todayTz = getDatePartsInConfiguredTimezone(now);
    const fechaEventoString = String(evento.fechaEvento).split('T')[0];
    const [eventYear, eventMonth, eventDay] = fechaEventoString
        .split('-')
        .map((part) => Number.parseInt(part, 10));
    const isTodayEvent = Number.isFinite(eventYear) &&
        Number.isFinite(eventMonth) &&
        Number.isFinite(eventDay) &&
        eventYear === todayTz.year &&
        eventMonth === todayTz.month &&
        eventDay === todayTz.day;
    return isTodayEvent
        ? new Date(eventDateTime)
        : new Date(eventDateTime.getTime() - 10 * 60 * 1000);
};
const buildEventReminderMessage = (evento) => {
    const message = {
        idEvento: evento.idEvento,
        nombreEvento: evento.nombreEvento,
        fechaEvento: evento.fechaEvento,
        horaEvento: evento.horaEvento,
        descripcionEvento: normalizeEventDescription(evento.descripcionEvento),
        tipoEvento: evento.tipoEvento,
    };
    if (evento.tipoEvento === 'concentracion') {
        message.link = buildConcentrationSessionUrl(evento.idEvento);
    }
    return message;
};
const getLegacyReminderSignature = (evento) => {
    const reminderTime = calculateReminderTime(evento);
    if (!reminderTime)
        return null;
    return {
        titulo: `Recordatorio: ${evento.nombreEvento}`,
        fechaProgramada: reminderTime,
    };
};
const clearPendingEventReminders = async (idUsuario, idEvento, legacySignature) => {
    const deletedByEventId = await (0, NotificacionesProgramadasRepository_1.deletePendingEventNotificationsByEventId)(idUsuario, idEvento);
    let deletedByLegacy = 0;
    if (legacySignature) {
        deletedByLegacy = await (0, NotificacionesProgramadasRepository_1.deletePendingEventNotificationsByLegacySignature)(idUsuario, legacySignature.titulo, legacySignature.fechaProgramada);
    }
    const totalDeleted = deletedByEventId + deletedByLegacy;
    if (totalDeleted > 0) {
        console.log(`🧹 Notificaciones pendientes limpiadas para evento ${idEvento}: ${totalDeleted}`);
    }
};
const scheduleEventReminder = async (evento, idUsuario, options) => {
    const legacySignature = options?.legacySignature ?? null;
    try {
        await clearPendingEventReminders(idUsuario, evento.idEvento, legacySignature);
        const preferencias = await preferenciasRepository.findOne({
            where: { idUsuario },
        });
        const eventosHabilitados = preferencias?.eventos ?? true;
        if (!eventosHabilitados) {
            console.log(`🔕 Notificaciones de eventos desactivadas para usuario ${idUsuario}`);
            return;
        }
        if (!shouldScheduleEventReminder(evento)) {
            console.log(`ℹ️ Recordatorio omitido para evento ${evento.idEvento} por estado ${String(evento.estado)}`);
            return;
        }
        const reminderTime = calculateReminderTime(evento);
        if (!reminderTime)
            return;
        const now = new Date();
        if (reminderTime <= now) {
            console.warn(`⚠️ Tiempo de recordatorio ${reminderTime.toISOString()} ya pasó para evento ${evento.idEvento}`);
            return;
        }
        await NotificacionesProgramadasService_1.NotificacionesProgramadasService.createScheduledNotification({
            idUsuario,
            tipo: 'evento',
            titulo: `Recordatorio: ${evento.nombreEvento}`,
            mensaje: JSON.stringify(buildEventReminderMessage(evento)),
            fechaProgramada: reminderTime,
        });
        console.log(`✅ Notificación programada para evento ${evento.idEvento} a las ${reminderTime.toISOString()}`);
    }
    catch (error) {
        console.error(`❌ Error programando recordatorio para evento ${evento.idEvento}:`, error);
    }
};
exports.EventoService = {
    async getEventosByUsuario(userId) {
        try {
            if (!userId || userId <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido'
                };
            }
            const eventos = await (0, EventoRepository_1.findEventosByUsuario)(userId);
            const eventosMapeados = eventos.map(evento => {
                const baseResponse = {
                    idEvento: evento.idEvento,
                    nombreEvento: evento.nombreEvento,
                    fechaEvento: evento.fechaEvento,
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
        }
        catch (error) {
            console.error('Error al obtener eventos del usuario:', error);
            return {
                success: false,
                error: 'Error interno al obtener eventos'
            };
        }
    },
    async crearEvento(data) {
        try {
            if (!data.fechaEvento) {
                return {
                    success: false,
                    error: 'Fecha del evento es requerida'
                };
            }
            if (!validarFormatoFecha(data.fechaEvento)) {
                return {
                    success: false,
                    error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                };
            }
            console.log('🔍 Fecha original recibida:', data.fechaEvento);
            if (!data.horaEvento || !/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(data.horaEvento)) {
                return {
                    success: false,
                    error: 'Formato de hora inválido. Use HH:MM o HH:MM:SS'
                };
            }
            if (data.estado !== undefined && !validarStatus(data.estado)) {
                return {
                    success: false,
                    error: 'Estado inválido. Debe ser null, "pendiente" o "completado"'
                };
            }
            const usuario = await userRepository.findOne({ where: { idUsuario: data.idUsuario } });
            if (!usuario) {
                return {
                    success: false,
                    error: 'Usuario no válido'
                };
            }
            let metodoEntity = null;
            if (data.idMetodo) {
                metodoEntity = await ormconfig_1.AppDataSource.getRepository(MetodoEstudio_entity_1.MetodoEstudioEntity).findOne({
                    where: { idMetodo: data.idMetodo }
                });
                if (!metodoEntity) {
                    return {
                        success: false,
                        error: 'Método de estudio no válido'
                    };
                }
            }
            let albumEntity = null;
            if (data.idAlbum) {
                albumEntity = await ormconfig_1.AppDataSource.getRepository(AlbumMusica_entity_1.AlbumMusicaEntity).findOne({
                    where: { idAlbum: data.idAlbum }
                });
                if (!albumEntity) {
                    return {
                        success: false,
                        error: 'Álbum de música no válido'
                    };
                }
            }
            const nuevoEvento = EventoRepository_1.EventoRepository.create({
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento: data.descripcionEvento,
                tipoEvento: data.tipoEvento,
                estado: data.estado || null,
                usuario: usuario,
                metodoEstudio: metodoEntity,
                album: albumEntity
            });
            const guardarEvento = await EventoRepository_1.EventoRepository.save(nuevoEvento);
            const eventoCompleto = await EventoRepository_1.EventoRepository.findOne({
                where: { idEvento: guardarEvento.idEvento },
                relations: ['usuario', 'metodoEstudio', 'album']
            });
            if (!eventoCompleto) {
                throw new Error('Error al recuperar el evento creado');
            }
            console.log('🔍 Fecha recuperada de BD:', eventoCompleto.fechaEvento);
            await scheduleEventReminder(eventoCompleto, data.idUsuario);
            const baseResponse = {
                idEvento: eventoCompleto.idEvento,
                nombreEvento: eventoCompleto.nombreEvento,
                fechaEvento: eventoCompleto.fechaEvento,
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
        }
        catch (error) {
            console.error('Error al crear el evento', error);
            return {
                success: false,
                error: 'Error interno al crear evento'
            };
        }
    },
    async deleteEvento(id_evento, userId) {
        try {
            const evento = await EventoRepository_1.EventoRepository.findOne({
                where: { idEvento: id_evento },
                relations: ['usuario']
            });
            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }
            if (evento.usuario?.idUsuario !== userId) {
                return {
                    success: false,
                    error: "No tienes permisos para eliminar este evento"
                };
            }
            await EventoRepository_1.EventoRepository.remove(evento);
            return {
                success: true,
                message: "Evento eliminado correctamente"
            };
        }
        catch (error) {
            console.error("Error al eliminar evento:", error);
            return {
                success: false,
                error: "Error interno al eliminar evento"
            };
        }
    },
    async updateEvento(id, userId, data) {
        try {
            const evento = await EventoRepository_1.EventoRepository.findOne({
                where: { idEvento: id },
                relations: ['usuario', 'metodoEstudio', 'album']
            });
            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }
            if (evento.usuario?.idUsuario !== userId) {
                return {
                    success: false,
                    error: "No tienes permisos para modificar este evento"
                };
            }
            const legacyReminderSignature = getLegacyReminderSignature(evento);
            const updateData = {};
            if (data.nombreEvento !== undefined)
                updateData.nombreEvento = data.nombreEvento;
            if (data.fechaEvento !== undefined) {
                if (!validarFormatoFecha(data.fechaEvento)) {
                    return {
                        success: false,
                        error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                    };
                }
                updateData.fechaEvento = data.fechaEvento;
            }
            if (data.horaEvento !== undefined)
                updateData.horaEvento = data.horaEvento;
            if (data.descripcionEvento !== undefined)
                updateData.descripcionEvento = data.descripcionEvento;
            if (data.tipoEvento !== undefined)
                updateData.tipoEvento = data.tipoEvento;
            if (data.estado !== undefined) {
                if (!validarStatus(data.estado)) {
                    return {
                        success: false,
                        error: 'Estado inválido. Debe ser null, "pendiente" o "completado"'
                    };
                }
                updateData.estado = data.estado;
            }
            if (data.idMetodo !== undefined) {
                const metodo = await MetodoEstudioRepository_1.metodoEstudioRepository.findById(data.idMetodo);
                if (!metodo) {
                    return {
                        success: false,
                        error: 'Método de estudio no válido'
                    };
                }
                updateData.metodoEstudio = metodo;
            }
            if (data.idAlbum !== undefined) {
                if (data.idAlbum === null) {
                    updateData.album = null;
                }
                else {
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
            await EventoRepository_1.EventoRepository.update(id, updateData);
            const eventoActualizado = await EventoRepository_1.EventoRepository.findOne({
                where: { idEvento: id },
                relations: ['usuario', 'metodoEstudio', 'album']
            });
            if (!eventoActualizado) {
                return {
                    success: false,
                    error: "Error al recuperar el evento actualizado"
                };
            }
            await scheduleEventReminder(eventoActualizado, userId, {
                legacySignature: legacyReminderSignature
            });
            const baseResponse = {
                idEvento: eventoActualizado.idEvento,
                nombreEvento: eventoActualizado.nombreEvento,
                fechaEvento: eventoActualizado.fechaEvento,
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
        }
        catch (error) {
            console.error("Error al actualizar evento:", error);
            return {
                success: false,
                error: "Error interno al actualizar evento"
            };
        }
    },
    async marcarComoCompletado(id, userId) {
        try {
            console.log(`🔍 Buscando evento ${id} para usuario ${userId}`);
            const evento = await EventoRepository_1.EventoRepository.findOne({
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
            await EventoRepository_1.EventoRepository.update(id, { estado: 'completado' });
            return {
                success: true,
                message: "Evento marcado como completado"
            };
        }
        catch (error) {
            console.error("Error al marcar evento como completado:", error);
            return {
                success: false,
                error: "Error interno al marcar evento como completado"
            };
        }
    },
    async marcarComoPendiente(id, userId) {
        try {
            const evento = await EventoRepository_1.EventoRepository.findOne({
                where: { idEvento: id },
                relations: ['usuario']
            });
            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }
            if (evento.usuario?.idUsuario !== userId) {
                return {
                    success: false,
                    error: "No tienes permisos para modificar este evento"
                };
            }
            await EventoRepository_1.EventoRepository.update(id, { estado: 'pendiente' });
            return {
                success: true,
                message: "Evento marcado como pendiente"
            };
        }
        catch (error) {
            console.error("Error al marcar evento como pendiente:", error);
            return {
                success: false,
                error: "Error interno al marcar evento como pendiente"
            };
        }
    },
    async actualizarEstado(id, userId, estado) {
        try {
            const evento = await EventoRepository_1.EventoRepository.findOne({
                where: { idEvento: id },
                relations: ['usuario']
            });
            if (!evento) {
                return {
                    success: false,
                    error: "Evento no encontrado"
                };
            }
            if (evento.usuario?.idUsuario !== userId) {
                return {
                    success: false,
                    error: "No tienes permisos para modificar este evento"
                };
            }
            await EventoRepository_1.EventoRepository.update(id, { estado });
            return {
                success: true,
                message: `Estado del evento actualizado a ${estado === null ? 'null' : estado}`
            };
        }
        catch (error) {
            console.error("Error al actualizar estado del evento:", error);
            return {
                success: false,
                error: "Error interno al actualizar estado del evento"
            };
        }
    }
};
