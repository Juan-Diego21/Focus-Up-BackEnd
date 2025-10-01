"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.beneficioController = exports.BeneficioController = void 0;
const BeneficioService_1 = require("../services/BeneficioService");
const logger_1 = __importDefault(require("../utils/logger"));
class BeneficioController {
    async createBeneficio(req, res) {
        try {
            const beneficioData = req.body;
            const result = await BeneficioService_1.beneficioService.createBeneficio(beneficioData);
            if (!result.success) {
                const response = {
                    success: false,
                    message: result.message || "Error al crear beneficio",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: "Beneficio creado exitosamente",
                data: result.beneficio,
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioController.createBeneficio:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getBeneficioById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    message: "ID inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await BeneficioService_1.beneficioService.getBeneficioById(id);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener beneficio",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(404).json(response);
            }
            const response = {
                success: true,
                message: "Beneficio encontrado",
                data: result.beneficio,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioController.getBeneficioById:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async updateBeneficio(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    message: "ID inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const updateData = req.body;
            const result = await BeneficioService_1.beneficioService.updateBeneficio(id, updateData);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al actualizar beneficio",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: "Beneficio actualizado exitosamente",
                data: result.beneficio,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioController.updateBeneficio:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async deleteBeneficio(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    message: "ID inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await BeneficioService_1.beneficioService.deleteBeneficio(id);
            const response = {
                success: result.success,
                message: result.success ? "Beneficio eliminado correctamente" : "Error eliminando beneficio",
                error: result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 404).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioController.deleteBeneficio:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getAllBeneficios(req, res) {
        try {
            const result = await BeneficioService_1.beneficioService.getAllBeneficios();
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener beneficios",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: "Beneficios obtenidos exitosamente",
                data: result.beneficios,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en BeneficioController.getAllBeneficios:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
}
exports.BeneficioController = BeneficioController;
exports.beneficioController = new BeneficioController();
