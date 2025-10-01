"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.beneficioService = exports.BeneficioService = void 0;
const BeneficioRepository_1 = require("../repositories/BeneficioRepository");
const logger_1 = __importDefault(require("../utils/logger"));
class BeneficioService {
    async createBeneficio(beneficioData) {
        try {
            if (!beneficioData.descripcion_beneficio || beneficioData.descripcion_beneficio.trim().length === 0) {
                return {
                    success: false,
                    error: "La descripción del beneficio es requerida",
                };
            }
            const beneficio = await BeneficioRepository_1.beneficioRepository.create(beneficioData);
            return { success: true, beneficio };
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioService.createBeneficio:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno del servidor",
            };
        }
    }
    async getBeneficioById(id) {
        try {
            const beneficio = await BeneficioRepository_1.beneficioRepository.findById(id);
            if (!beneficio) {
                return { success: false, error: "Beneficio no encontrado" };
            }
            return { success: true, beneficio };
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioService.getBeneficioById:", error);
            return { success: false, error: "Error al obtener beneficio" };
        }
    }
    async updateBeneficio(id, updateData) {
        try {
            if (updateData.descripcion_beneficio !== undefined && updateData.descripcion_beneficio.trim().length === 0) {
                return {
                    success: false,
                    error: "La descripción del beneficio no puede estar vacía",
                };
            }
            const beneficio = await BeneficioRepository_1.beneficioRepository.update(id, updateData);
            if (!beneficio) {
                return { success: false, error: "Beneficio no encontrado" };
            }
            return { success: true, beneficio };
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioService.updateBeneficio:", error);
            return { success: false, error: "Error al actualizar beneficio" };
        }
    }
    async deleteBeneficio(id) {
        try {
            const deleted = await BeneficioRepository_1.beneficioRepository.delete(id);
            if (!deleted) {
                return { success: false, error: "Beneficio no encontrado" };
            }
            return { success: true };
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioService.deleteBeneficio:", error);
            return { success: false, error: "Error eliminando beneficio" };
        }
    }
    async getAllBeneficios() {
        try {
            const beneficios = await BeneficioRepository_1.beneficioRepository.findAll();
            return { success: true, beneficios };
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioService.getAllBeneficios:", error);
            return { success: false, error: "Error al obtener beneficios" };
        }
    }
}
exports.BeneficioService = BeneficioService;
exports.beneficioService = new BeneficioService();
