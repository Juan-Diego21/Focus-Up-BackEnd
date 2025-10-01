"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventoRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const Evento_entity_1 = require("../models/Evento.entity");
exports.EventoRepository = ormconfig_1.AppDataSource.getRepository(Evento_entity_1.EventoEntity);
