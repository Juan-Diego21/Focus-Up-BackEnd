"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionesProgramadasService = void 0;
const NotificacionesProgramadasRepository_1 = require("../repositories/NotificacionesProgramadasRepository");
const ormconfig_1 = require("../config/ormconfig");
const User_entity_1 = require("../models/User.entity");
const NotificacionesUsuario_entity_1 = require("../models/NotificacionesUsuario.entity");
const MetodoRealizado_entity_1 = require("../models/MetodoRealizado.entity");
const Evento_entity_1 = require("../models/Evento.entity");
const motivationalMessages_1 = require("../config/motivationalMessages");
const logger_1 = __importDefault(require("../utils/logger"));
const userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
const preferencesRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesUsuario_entity_1.NotificacionesUsuarioEntity);
const EVENT_TIMEZONE_OFFSET_MINUTES = Number.parseInt(process.env.EVENT_TIMEZONE_OFFSET_MINUTES ?? '-300', 10);
const parsedWeeklyMotivationDelayMs = Number.parseInt(process.env.WEEKLY_MOTIVATION_DELAY_MS ?? '15000', 10);
const WEEKLY_MOTIVATION_DELAY_MS = Number.isFinite(parsedWeeklyMotivationDelayMs) &&
    parsedWeeklyMotivationDelayMs >= 1000
    ? parsedWeeklyMotivationDelayMs
    : 15000;
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
exports.NotificacionesProgramadasService = {
    async createScheduledNotification(data) {
        try {
            logger_1.default.info(`Intentando crear notificación programada para usuario ${data.idUsuario}, tipo: ${data.tipo}`);
            const usuario = await userRepository.findOne({ where: { idUsuario: data.idUsuario } });
            if (!usuario) {
                logger_1.default.warn(`Usuario ${data.idUsuario} no encontrado al crear notificación`);
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }
            if (!data.tipo || data.tipo.trim().length === 0) {
                logger_1.default.warn(`Tipo de notificación vacío para usuario ${data.idUsuario}`);
                return {
                    success: false,
                    error: 'El tipo de notificación es requerido'
                };
            }
            const now = new Date();
            if (data.fechaProgramada <= now) {
                logger_1.default.warn(`Fecha programada ${data.fechaProgramada} no es futura para usuario ${data.idUsuario}`);
                return {
                    success: false,
                    error: 'La fecha programada debe ser en el futuro'
                };
            }
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            if (data.fechaProgramada > oneYearFromNow) {
                logger_1.default.warn(`Fecha programada ${data.fechaProgramada} demasiado lejana para usuario ${data.idUsuario}`);
                return {
                    success: false,
                    error: 'La fecha programada no puede ser más de 1 año en el futuro'
                };
            }
            const duplicate = await NotificacionesProgramadasRepository_1.NotificacionesProgramadasRepository.findOne({
                where: {
                    idUsuario: data.idUsuario,
                    tipo: data.tipo.trim(),
                    titulo: data.titulo?.trim(),
                    fechaProgramada: data.fechaProgramada,
                    enviada: false
                }
            });
            if (duplicate) {
                logger_1.default.info(`Notificación duplicada omitida para usuario ${data.idUsuario}, tipo: ${data.tipo}`);
                return {
                    success: true,
                    message: 'Notificación ya programada previamente',
                    data: duplicate
                };
            }
            const nuevaNotificacion = await (0, NotificacionesProgramadasRepository_1.createScheduledNotification)({
                idUsuario: data.idUsuario,
                tipo: data.tipo.trim(),
                titulo: data.titulo?.trim(),
                mensaje: data.mensaje?.trim(),
                fechaProgramada: data.fechaProgramada
            });
            logger_1.default.info(`Notificación programada creada exitosamente: ID ${nuevaNotificacion.idNotificacion} para usuario ${data.idUsuario}`);
            return {
                success: true,
                message: 'Notificación programada creada correctamente',
                data: nuevaNotificacion
            };
        }
        catch (error) {
            logger_1.default.error(`Error al crear notificación programada para usuario ${data.idUsuario}:`, error);
            return {
                success: false,
                error: 'Error interno al crear notificación programada'
            };
        }
    },
    async getPendingNotifications() {
        try {
            logger_1.default.info('Consultando notificaciones pendientes de envío');
            const notificaciones = await (0, NotificacionesProgramadasRepository_1.getPendingNotifications)();
            logger_1.default.info(`Encontradas ${notificaciones.length} notificaciones pendientes`);
            return {
                success: true,
                data: notificaciones
            };
        }
        catch (error) {
            logger_1.default.error('Error al obtener notificaciones pendientes:', error);
            return {
                success: false,
                error: 'Error interno al obtener notificaciones pendientes'
            };
        }
    },
    async getUpcomingEventsWithNotifications(userId) {
        try {
            logger_1.default.info(`Consultando todas las notificaciones programadas para usuario ${userId}`);
            const now = new Date();
            const todayTz = getDatePartsInConfiguredTimezone(now);
            const allNotifications = [];
            const preferencias = await preferencesRepository.findOne({ where: { idUsuario: userId } });
            const eventosEnabled = preferencias?.eventos ?? true;
            const metodosEnabled = preferencias?.metodosPendientes ?? true;
            const motivacionEnabled = preferencias?.motivacion ?? true;
            if (eventosEnabled) {
                try {
                    const eventos = await ormconfig_1.AppDataSource.getRepository(Evento_entity_1.EventoEntity)
                        .createQueryBuilder("evento")
                        .leftJoinAndSelect("evento.metodoEstudio", "metodo")
                        .leftJoinAndSelect("evento.album", "album")
                        .where("evento.id_usuario = :userId", { userId })
                        .andWhere("(evento.estado IS NULL OR evento.estado = :pendiente)", { pendiente: 'pendiente' })
                        .orderBy("evento.fecha_evento", "ASC")
                        .addOrderBy("evento.hora_evento", "ASC")
                        .getMany();
                    logger_1.default.info(`Encontrados ${eventos.length} eventos pendientes para usuario ${userId}`);
                    for (const evento of eventos) {
                        try {
                            const eventDateTime = parseLocalDateTime(evento.fechaEvento, evento.horaEvento);
                            if (!eventDateTime) {
                                logger_1.default.warn(`Fecha/hora inválida para evento ${evento.idEvento}: ${evento.fechaEvento}T${evento.horaEvento}`);
                                continue;
                            }
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
                            let notificationTime;
                            if (isTodayEvent) {
                                notificationTime = new Date(eventDateTime);
                            }
                            else {
                                notificationTime = new Date(eventDateTime.getTime() - 10 * 60 * 1000);
                            }
                            if (notificationTime >= now) {
                                allNotifications.push({
                                    type: 'event',
                                    idEvento: evento.idEvento,
                                    nombreEvento: evento.nombreEvento,
                                    fechaEvento: evento.fechaEvento,
                                    horaEvento: evento.horaEvento,
                                    descripcionEvento: evento.descripcionEvento,
                                    estado: evento.estado,
                                    metodoEstudio: evento.metodoEstudio ? {
                                        idMetodo: evento.metodoEstudio.idMetodo,
                                        nombreMetodo: evento.metodoEstudio.nombreMetodo
                                    } : null,
                                    album: evento.album ? {
                                        idAlbum: evento.album.idAlbum,
                                        nombreAlbum: evento.album.nombreAlbum
                                    } : null,
                                    notificationTime: notificationTime.toISOString(),
                                    notificationRule: isTodayEvent ? 'same_day' : 'future_10min_before'
                                });
                            }
                        }
                        catch (error) {
                            logger_1.default.error(`Error procesando evento ${evento.idEvento}:`, error);
                        }
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error obteniendo notificaciones de eventos para usuario ${userId}:`, error);
                }
            }
            if (metodosEnabled) {
                try {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const metodosIncompletos = await ormconfig_1.AppDataSource.getRepository(MetodoRealizado_entity_1.MetodoRealizadoEntity)
                        .createQueryBuilder("mr")
                        .leftJoinAndSelect("mr.metodo", "m")
                        .where("mr.id_usuario = :userId", { userId })
                        .andWhere("mr.progreso < :completado", { completado: 100 })
                        .andWhere("mr.fecha_creacion <= :sevenDaysAgo", { sevenDaysAgo })
                        .orderBy("mr.fecha_creacion", "ASC")
                        .getMany();
                    logger_1.default.info(`Encontrados ${metodosIncompletos.length} métodos incompletos para recordatorios`);
                    for (const metodo of metodosIncompletos) {
                        const notificationTime = new Date(now);
                        notificationTime.setHours(notificationTime.getHours() + 1);
                        allNotifications.push({
                            type: 'incomplete_study_method',
                            idReporte: metodo.idMetodoRealizado,
                            nombreMetodo: metodo.metodo?.nombreMetodo || 'Método desconocido',
                            progreso: metodo.progreso,
                            notificationTime: notificationTime.toISOString()
                        });
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error obteniendo recordatorios de métodos para usuario ${userId}:`, error);
                }
            }
            if (motivacionEnabled) {
                const notificationTime = new Date();
                notificationTime.setDate(notificationTime.getDate() + 7);
                const currentWeek = (0, motivationalMessages_1.getCurrentWeekNumber)();
                allNotifications.push({
                    type: 'weekly_motivation',
                    notificationTime: notificationTime.toISOString(),
                    templateId: currentWeek
                });
            }
            allNotifications.sort((a, b) => new Date(a.notificationTime).getTime() - new Date(b.notificationTime).getTime());
            logger_1.default.info(`Retornando ${allNotifications.length} notificaciones programadas totales para usuario ${userId}`);
            return { success: true, data: allNotifications };
        }
        catch (error) {
            logger_1.default.error(`Error al obtener notificaciones programadas para usuario ${userId}:`, error);
            return {
                success: false,
                error: 'Error interno al obtener notificaciones programadas'
            };
        }
    },
    async markAsSent(idNotificacion) {
        try {
            logger_1.default.info(`Marcando notificación ${idNotificacion} como enviada`);
            const notificacion = await NotificacionesProgramadasRepository_1.NotificacionesProgramadasRepository.findOne({
                where: { idNotificacion }
            });
            if (!notificacion) {
                logger_1.default.warn(`Notificación ${idNotificacion} no encontrada al marcar como enviada`);
                return {
                    success: false,
                    error: 'Notificación no encontrada'
                };
            }
            if (notificacion.enviada) {
                logger_1.default.warn(`Notificación ${idNotificacion} ya estaba marcada como enviada`);
                return {
                    success: false,
                    error: 'La notificación ya fue enviada'
                };
            }
            const updated = await (0, NotificacionesProgramadasRepository_1.markAsSent)(idNotificacion);
            if (updated) {
                logger_1.default.info(`Notificación ${idNotificacion} marcada como enviada exitosamente`);
                return {
                    success: true,
                    message: 'Notificación marcada como enviada'
                };
            }
            else {
                logger_1.default.error(`Error al actualizar notificación ${idNotificacion}`);
                return {
                    success: false,
                    error: 'Error al marcar notificación como enviada'
                };
            }
        }
        catch (error) {
            logger_1.default.error(`Error al marcar notificación ${idNotificacion} como enviada:`, error);
            return {
                success: false,
                error: 'Error interno al marcar notificación como enviada'
            };
        }
    },
    async scheduleWeeklyMotivationalEmails() {
        try {
            logger_1.default.info('Iniciando programación de emails motivacionales semanales');
            const currentWeek = (0, motivationalMessages_1.getCurrentWeekNumber)();
            const mensajeSemanal = (0, motivationalMessages_1.getWeeklyMotivationalMessage)(currentWeek);
            logger_1.default.info(`Semana ${currentWeek}: mensaje motivacional seleccionado`);
            const notificacionesUsuarioRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesUsuario_entity_1.NotificacionesUsuarioEntity);
            const usuariosSuscritos = await notificacionesUsuarioRepository.find({
                where: { motivacion: true },
                relations: ['usuario']
            });
            logger_1.default.info(`Encontrados ${usuariosSuscritos.length} usuarios suscritos a motivación semanal`);
            let programadas = 0;
            let errores = 0;
            const now = new Date();
            const fechaEnvio = new Date(now.getTime() + WEEKLY_MOTIVATION_DELAY_MS);
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            for (const notificacionUsuario of usuariosSuscritos) {
                try {
                    const existingInWeek = await NotificacionesProgramadasRepository_1.NotificacionesProgramadasRepository
                        .createQueryBuilder("n")
                        .where("n.idUsuario = :idUsuario", { idUsuario: notificacionUsuario.idUsuario })
                        .andWhere("n.tipo = :tipo", { tipo: "motivation" })
                        .andWhere("n.fechaProgramada BETWEEN :weekStart AND :weekEnd", { weekStart, weekEnd })
                        .getCount();
                    if (existingInWeek > 0) {
                        logger_1.default.debug(`Email motivacional omitido por duplicado semanal para usuario ${notificacionUsuario.idUsuario}`);
                        continue;
                    }
                    const created = await this.createScheduledNotification({
                        idUsuario: notificacionUsuario.idUsuario,
                        tipo: "motivation",
                        titulo: "Weekly Motivation",
                        mensaje: mensajeSemanal,
                        fechaProgramada: fechaEnvio
                    });
                    if (!created.success) {
                        errores++;
                        logger_1.default.error(`Error al programar email motivacional para usuario ${notificacionUsuario.idUsuario}: ${created.error}`);
                        continue;
                    }
                    programadas++;
                    logger_1.default.debug(`Email motivacional programado para usuario ${notificacionUsuario.idUsuario} en ${fechaEnvio.toISOString()}`);
                }
                catch (error) {
                    errores++;
                    logger_1.default.error(`Error al programar email motivacional para usuario ${notificacionUsuario.idUsuario}:`, error);
                }
            }
            logger_1.default.info(`Programación semanal completada: ${programadas} emails programados, ${errores} errores`);
            return {
                success: true,
                message: `Emails motivacionales semanales programados: ${programadas} exitosos, ${errores} errores`,
                data: {
                    programadas,
                    errores,
                    semana: currentWeek,
                    mensaje: mensajeSemanal
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error al programar emails motivacionales semanales:', error);
            return {
                success: false,
                error: 'Error interno al programar emails motivacionales'
            };
        }
    }
};
