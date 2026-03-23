"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePendingEventNotificationsByLegacySignature = exports.deletePendingEventNotificationsByEventId = exports.markAsSent = exports.getPendingNotifications = exports.createScheduledNotification = exports.NotificacionesProgramadasRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const NotificacionesProgramadas_entity_1 = require("../models/NotificacionesProgramadas.entity");
exports.NotificacionesProgramadasRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesProgramadas_entity_1.NotificacionesProgramadasEntity);
const createScheduledNotification = async (data) => {
    const nuevaNotificacion = exports.NotificacionesProgramadasRepository.create({
        ...data,
        enviada: false,
        fechaEnvio: undefined
    });
    return await exports.NotificacionesProgramadasRepository.save(nuevaNotificacion);
};
exports.createScheduledNotification = createScheduledNotification;
const getPendingNotifications = async () => {
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 10000);
    return await exports.NotificacionesProgramadasRepository
        .createQueryBuilder("notificacion")
        .leftJoinAndSelect("notificacion.usuario", "usuario")
        .where("notificacion.enviada = :enviada", { enviada: false })
        .andWhere("notificacion.fechaProgramada <= :bufferTime", { bufferTime })
        .orderBy("notificacion.fechaProgramada", "ASC")
        .getMany();
};
exports.getPendingNotifications = getPendingNotifications;
const markAsSent = async (idNotificacion) => {
    const result = await exports.NotificacionesProgramadasRepository.update(idNotificacion, {
        enviada: true,
        fechaEnvio: new Date()
    });
    return result.affected && result.affected > 0;
};
exports.markAsSent = markAsSent;
const deletePendingEventNotificationsByEventId = async (idUsuario, idEvento) => {
    if (!Number.isFinite(idEvento) || idEvento <= 0)
        return 0;
    const compactPattern = `%"idEvento":${idEvento}%`;
    const spacedPattern = `%"idEvento": ${idEvento}%`;
    const stringPattern = `%"idEvento":"${idEvento}"%`;
    const result = await exports.NotificacionesProgramadasRepository
        .createQueryBuilder()
        .delete()
        .from(NotificacionesProgramadas_entity_1.NotificacionesProgramadasEntity)
        .where("id_usuario = :idUsuario", { idUsuario })
        .andWhere("tipo = :tipo", { tipo: "evento" })
        .andWhere("enviada = false")
        .andWhere("(mensaje LIKE :compactPattern OR mensaje LIKE :spacedPattern OR mensaje LIKE :stringPattern)", { compactPattern, spacedPattern, stringPattern })
        .execute();
    return result.affected ?? 0;
};
exports.deletePendingEventNotificationsByEventId = deletePendingEventNotificationsByEventId;
const deletePendingEventNotificationsByLegacySignature = async (idUsuario, titulo, fechaProgramada) => {
    if (!titulo || !fechaProgramada || Number.isNaN(fechaProgramada.getTime()))
        return 0;
    const windowStart = new Date(fechaProgramada.getTime() - 60000);
    const windowEnd = new Date(fechaProgramada.getTime() + 60000);
    const result = await exports.NotificacionesProgramadasRepository
        .createQueryBuilder()
        .delete()
        .from(NotificacionesProgramadas_entity_1.NotificacionesProgramadasEntity)
        .where("id_usuario = :idUsuario", { idUsuario })
        .andWhere("tipo = :tipo", { tipo: "evento" })
        .andWhere("enviada = false")
        .andWhere("titulo = :titulo", { titulo })
        .andWhere("fecha_programada BETWEEN :windowStart AND :windowEnd", {
        windowStart,
        windowEnd,
    })
        .execute();
    return result.affected ?? 0;
};
exports.deletePendingEventNotificationsByLegacySignature = deletePendingEventNotificationsByLegacySignature;
