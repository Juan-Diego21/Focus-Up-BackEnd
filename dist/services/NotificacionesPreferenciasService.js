"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionesPreferenciasService = void 0;
const NotificacionesPreferenciasRepository_1 = require("../repositories/NotificacionesPreferenciasRepository");
const ormconfig_1 = require("../config/ormconfig");
const User_entity_1 = require("../models/User.entity");
const userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
exports.NotificacionesPreferenciasService = {
    async getPreferenciasByUsuario(userId) {
        try {
            if (!userId || userId <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido'
                };
            }
            const usuario = await userRepository.findOne({ where: { idUsuario: userId } });
            if (!usuario) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }
            let preferencias = await (0, NotificacionesPreferenciasRepository_1.findPreferenciasByUsuario)(userId);
            if (!preferencias) {
                preferencias = await (0, NotificacionesPreferenciasRepository_1.upsertPreferencias)(userId, {});
            }
            if (!preferencias) {
                throw new Error('Error al crear preferencias por defecto');
            }
            const preferenciasMapeadas = {
                idUsuario: preferencias.idUsuario,
                eventos: preferencias.eventos,
                metodosPendientes: preferencias.metodosPendientes,
                sesionesPendientes: preferencias.sesionesPendientes,
                motivacion: preferencias.motivacion,
                fechaActualizacion: preferencias.fechaActualizacion
            };
            return {
                success: true,
                data: preferenciasMapeadas
            };
        }
        catch (error) {
            console.error('Error al obtener preferencias de notificaciones:', error);
            return {
                success: false,
                error: 'Error interno al obtener preferencias'
            };
        }
    },
    async updatePreferencias(userId, data) {
        try {
            if (!userId || userId <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido'
                };
            }
            const usuario = await userRepository.findOne({ where: { idUsuario: userId } });
            if (!usuario) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }
            const camposValidos = ['eventos', 'metodosPendientes', 'sesionesPendientes', 'motivacion'];
            for (const campo of camposValidos) {
                if (data[campo] !== undefined) {
                    const valor = data[campo];
                    if (typeof valor !== 'boolean') {
                        return {
                            success: false,
                            error: `El campo ${campo} debe ser un valor booleano (true o false)`
                        };
                    }
                }
            }
            const updateData = {};
            if (data.eventos !== undefined)
                updateData.eventos = data.eventos;
            if (data.metodosPendientes !== undefined)
                updateData.metodosPendientes = data.metodosPendientes;
            if (data.sesionesPendientes !== undefined)
                updateData.sesionesPendientes = data.sesionesPendientes;
            if (data.motivacion !== undefined)
                updateData.motivacion = data.motivacion;
            const preferenciasActualizadas = await (0, NotificacionesPreferenciasRepository_1.upsertPreferencias)(userId, updateData);
            if (!preferenciasActualizadas) {
                return {
                    success: false,
                    error: 'Error al actualizar preferencias'
                };
            }
            const preferenciasMapeadas = {
                idUsuario: preferenciasActualizadas.idUsuario,
                eventos: preferenciasActualizadas.eventos,
                metodosPendientes: preferenciasActualizadas.metodosPendientes,
                sesionesPendientes: preferenciasActualizadas.sesionesPendientes,
                motivacion: preferenciasActualizadas.motivacion,
                fechaActualizacion: preferenciasActualizadas.fechaActualizacion
            };
            return {
                success: true,
                message: 'Preferencias de notificaciones actualizadas correctamente',
                data: preferenciasMapeadas
            };
        }
        catch (error) {
            console.error('Error al actualizar preferencias de notificaciones:', error);
            return {
                success: false,
                error: 'Error interno al actualizar preferencias'
            };
        }
    }
};
