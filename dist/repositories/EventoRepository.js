"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findEventosByUsuario = exports.EventoRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const Evento_entity_1 = require("../models/Evento.entity");
exports.EventoRepository = ormconfig_1.AppDataSource.getRepository(Evento_entity_1.EventoEntity);
const findEventosByUsuario = async (userId) => {
    return await ormconfig_1.AppDataSource
        .getRepository(Evento_entity_1.EventoEntity)
        .createQueryBuilder("evento")
        .leftJoinAndSelect("evento.metodoEstudio", "metodo")
        .leftJoinAndSelect("evento.album", "album")
        .leftJoinAndSelect("evento.usuario", "usuario")
        .where("evento.usuario = :userId", { userId })
        .orderBy("evento.fechaEvento", "ASC")
        .addOrderBy("evento.horaEvento", "ASC")
        .getMany();
};
exports.findEventosByUsuario = findEventosByUsuario;
