"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metodoEstudioService = exports.MetodoEstudioService = void 0;
const MetodoEstudioRepository_1 = require("../repositories/MetodoEstudioRepository");
const logger_1 = __importDefault(require("../utils/logger"));
class MetodoEstudioService {
    async createMetodoEstudio(metodoData) {
        try {
            if (!metodoData.nombre_metodo || metodoData.nombre_metodo.trim().length === 0) {
                return {
                    success: false,
                    error: "El nombre del método de estudio es requerido",
                };
            }
            const metodo = await MetodoEstudioRepository_1.metodoEstudioRepository.create(metodoData);
            return { success: true, metodo };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.createMetodoEstudio:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno del servidor",
            };
        }
    }
    async getMetodoEstudioById(id) {
        try {
            const metodo = await MetodoEstudioRepository_1.metodoEstudioRepository.findById(id);
            if (!metodo) {
                return { success: false, error: "Método de estudio no encontrado" };
            }
            return { success: true, metodo };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.getMetodoEstudioById:", error);
            return { success: false, error: "Error al obtener método de estudio" };
        }
    }
    async updateMetodoEstudio(id, updateData) {
        try {
            if (updateData.nombre_metodo !== undefined && updateData.nombre_metodo.trim().length === 0) {
                return {
                    success: false,
                    error: "El nombre del método de estudio no puede estar vacío",
                };
            }
            const metodo = await MetodoEstudioRepository_1.metodoEstudioRepository.update(id, updateData);
            if (!metodo) {
                return { success: false, error: "Método de estudio no encontrado" };
            }
            return { success: true, metodo };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.updateMetodoEstudio:", error);
            return { success: false, error: "Error al actualizar método de estudio" };
        }
    }
    async deleteMetodoEstudio(id) {
        try {
            const deleted = await MetodoEstudioRepository_1.metodoEstudioRepository.delete(id);
            if (!deleted) {
                return { success: false, error: "Método de estudio no encontrado" };
            }
            return { success: true };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.deleteMetodoEstudio:", error);
            return { success: false, error: "Error eliminando método de estudio" };
        }
    }
    async getAllMetodosEstudio() {
        try {
            const metodos = await MetodoEstudioRepository_1.metodoEstudioRepository.findAll();
            return { success: true, metodos };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.getAllMetodosEstudio:", error);
            return { success: false, error: "Error al obtener métodos de estudio" };
        }
    }
    async getBeneficiosForMetodo(idMetodo) {
        try {
            const beneficios = await MetodoEstudioRepository_1.metodoEstudioRepository.getBeneficios(idMetodo);
            return { success: true, beneficios };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.getBeneficiosForMetodo:", error);
            return { success: false, error: "Error al obtener beneficios" };
        }
    }
    async addBeneficioToMetodo(idMetodo, idBeneficio) {
        try {
            const added = await MetodoEstudioRepository_1.metodoEstudioRepository.addBeneficio(idMetodo, idBeneficio);
            if (!added) {
                return { success: false, error: "Método o beneficio no encontrado, o ya asociado" };
            }
            return { success: true };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.addBeneficioToMetodo:", error);
            return { success: false, error: "Error asociando beneficio" };
        }
    }
    async removeBeneficioFromMetodo(idMetodo, idBeneficio) {
        try {
            const removed = await MetodoEstudioRepository_1.metodoEstudioRepository.removeBeneficio(idMetodo, idBeneficio);
            if (!removed) {
                return { success: false, error: "Asociación no encontrada" };
            }
            return { success: true };
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioService.removeBeneficioFromMetodo:", error);
            return { success: false, error: "Error removiendo beneficio" };
        }
    }
}
exports.MetodoEstudioService = MetodoEstudioService;
exports.metodoEstudioService = new MetodoEstudioService();
