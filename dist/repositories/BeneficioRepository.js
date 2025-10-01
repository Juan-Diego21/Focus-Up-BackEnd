"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beneficioRepository = exports.BeneficioRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const Beneficio_entity_1 = require("../models/Beneficio.entity");
class BeneficioRepository {
    constructor() {
        this.repository = ormconfig_1.AppDataSource.getRepository(Beneficio_entity_1.BeneficioEntity);
    }
    async create(beneficioInput) {
        const beneficio = this.repository.create({
            descripcionBeneficio: beneficioInput.descripcion_beneficio,
        });
        const savedBeneficio = await this.repository.save(beneficio);
        return this.mapToBeneficioDTO(savedBeneficio);
    }
    async findById(id) {
        const beneficio = await this.repository.findOne({
            where: { idBeneficio: id },
        });
        return beneficio ? this.mapToBeneficioDTO(beneficio) : null;
    }
    async update(id, updates) {
        const updateData = {};
        if (updates.descripcion_beneficio !== undefined)
            updateData.descripcionBeneficio = updates.descripcion_beneficio;
        const result = await this.repository.update(id, updateData);
        if (result.affected && result.affected > 0) {
            return this.findById(id);
        }
        return null;
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected !== null && result.affected !== undefined && result.affected > 0;
    }
    async findAll() {
        const beneficios = await this.repository.find();
        return beneficios.map((beneficio) => this.mapToBeneficioDTO(beneficio));
    }
    mapToBeneficioDTO(entity) {
        return {
            id_beneficio: entity.idBeneficio,
            descripcion_beneficio: entity.descripcionBeneficio,
            fecha_creacion: entity.fechaCreacion,
            fecha_actualizacion: entity.fechaActualizacion,
        };
    }
}
exports.BeneficioRepository = BeneficioRepository;
exports.beneficioRepository = new BeneficioRepository();
