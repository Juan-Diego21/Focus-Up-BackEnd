"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsSent = exports.getPendingNotifications = exports.createScheduledNotification = exports.NotificacionesProgramadasRepository = void 0;
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
