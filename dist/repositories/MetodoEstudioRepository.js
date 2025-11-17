"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metodoEstudioRepository = exports.MetodoEstudioRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const MetodoEstudio_entity_1 = require("../models/MetodoEstudio.entity");
const Beneficio_entity_1 = require("../models/Beneficio.entity");
const MetodoBeneficios_entity_1 = require("../models/MetodoBeneficios.entity");
class MetodoEstudioRepository {
    constructor() {
        this.repository = ormconfig_1.AppDataSource.getRepository(MetodoEstudio_entity_1.MetodoEstudioEntity);
        this.beneficioRepository = ormconfig_1.AppDataSource.getRepository(Beneficio_entity_1.BeneficioEntity);
        this.metodoBeneficiosRepository = ormconfig_1.AppDataSource.getRepository(MetodoBeneficios_entity_1.MetodoBeneficiosEntity);
    }
    async create(metodoInput) {
        const metodo = this.repository.create({
            nombreMetodo: metodoInput.nombre_metodo,
            descripcion: metodoInput.descripcion,
        });
        const savedMetodo = await this.repository.save(metodo);
        return this.mapToMetodoEstudioDTO(savedMetodo);
    }
    async findById(id) {
        const metodo = await this.repository.findOne({
            where: { idMetodo: id },
            relations: ["beneficios"],
        });
        return metodo ? this.mapToMetodoEstudioDTO(metodo) : null;
    }
    async update(id, updates) {
        const updateData = {};
        if (updates.nombre_metodo !== undefined)
            updateData.nombreMetodo = updates.nombre_metodo;
        if (updates.descripcion !== undefined)
            updateData.descripcion = updates.descripcion;
        const result = await this.repository.update(id, updateData);
        if (result.affected && result.affected > 0) {
            return this.findById(id);
        }
        return null;
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return (result.affected !== null &&
            result.affected !== undefined &&
            result.affected > 0);
    }
    async findAll() {
        const metodos = await this.repository.find({
            relations: ["beneficios"],
        });
        return metodos.map((metodo) => this.mapToMetodoEstudioDTO(metodo));
    }
    async addBeneficio(idMetodo, idBeneficio) {
        const metodo = await this.repository.findOne({ where: { idMetodo } });
        const beneficio = await this.beneficioRepository.findOne({
            where: { idBeneficio },
        });
        if (!metodo || !beneficio)
            return false;
        const existing = await this.metodoBeneficiosRepository.findOne({
            where: { idMetodo, idBeneficio },
        });
        if (existing)
            return true;
        const association = this.metodoBeneficiosRepository.create({
            idMetodo,
            idBeneficio,
        });
        await this.metodoBeneficiosRepository.save(association);
        return true;
    }
    async removeBeneficio(idMetodo, idBeneficio) {
        const result = await this.metodoBeneficiosRepository.delete({
            idMetodo,
            idBeneficio,
        });
        return (result.affected !== null &&
            result.affected !== undefined &&
            result.affected > 0);
    }
    async getBeneficios(idMetodo) {
        const metodo = await this.repository.findOne({
            where: { idMetodo },
            relations: ["beneficios"],
        });
        if (!metodo || !metodo.beneficios)
            return [];
        return metodo.beneficios.map((b) => ({
            id_beneficio: b.idBeneficio,
            descripcion_beneficio: b.descripcionBeneficio,
            fecha_creacion: b.fechaCreacion,
            fecha_actualizacion: b.fechaActualizacion,
        }));
    }
    mapToMetodoEstudioDTO(entity) {
        return {
            id_metodo: entity.idMetodo,
            nombre_metodo: entity.nombreMetodo,
            descripcion: entity.descripcion,
            fecha_creacion: entity.fechaCreacion,
            fecha_actualizacion: entity.fechaActualizacion,
            beneficios: entity.beneficios
                ? entity.beneficios.map((b) => ({
                    id_beneficio: b.idBeneficio,
                    descripcion_beneficio: b.descripcionBeneficio,
                    fecha_creacion: b.fechaCreacion,
                    fecha_actualizacion: b.fechaActualizacion,
                }))
                : [],
        };
    }
}
exports.MetodoEstudioRepository = MetodoEstudioRepository;
exports.metodoEstudioRepository = new MetodoEstudioRepository();
