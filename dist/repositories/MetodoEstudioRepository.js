"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetodoEstudioRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const MedotoEstudio_entity_1 = require("../models/MedotoEstudio.entity");
ormconfig_1.AppDataSource.getRepository(MedotoEstudio_entity_1.MetodoEstudio);
exports.MetodoEstudioRepository = ormconfig_1.AppDataSource.getRepository(MedotoEstudio_entity_1.MetodoEstudio);
