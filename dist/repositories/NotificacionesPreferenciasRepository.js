"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertPreferencias = exports.findPreferenciasByUsuario = exports.NotificacionesPreferenciasRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const NotificacionesUsuario_entity_1 = require("../models/NotificacionesUsuario.entity");
exports.NotificacionesPreferenciasRepository = ormconfig_1.AppDataSource.getRepository(NotificacionesUsuario_entity_1.NotificacionesUsuarioEntity);
const findPreferenciasByUsuario = async (userId) => {
    return await ormconfig_1.AppDataSource
        .getRepository(NotificacionesUsuario_entity_1.NotificacionesUsuarioEntity)
        .findOne({
        where: { idUsuario: userId },
        relations: ['usuario']
    });
};
exports.findPreferenciasByUsuario = findPreferenciasByUsuario;
const upsertPreferencias = async (userId, data) => {
    const existing = await (0, exports.findPreferenciasByUsuario)(userId);
    if (existing) {
        await exports.NotificacionesPreferenciasRepository.update(userId, data);
        return await (0, exports.findPreferenciasByUsuario)(userId);
    }
    else {
        const newPreferencias = exports.NotificacionesPreferenciasRepository.create({
            idUsuario: userId,
            eventos: data.eventos ?? true,
            metodosPendientes: data.metodosPendientes ?? true,
            sesionesPendientes: data.sesionesPendientes ?? true,
            motivacion: data.motivacion ?? true,
            ...data
        });
        const saved = await exports.NotificacionesPreferenciasRepository.save(newPreferencias);
        return await (0, exports.findPreferenciasByUsuario)(saved.idUsuario);
    }
};
exports.upsertPreferencias = upsertPreferencias;
