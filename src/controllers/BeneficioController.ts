import { Request, Response } from "express";
import { beneficioService } from "../services/BeneficioService";
import { ApiResponse } from "../types/ApiResponse";
import logger from "../utils/logger";

export class BeneficioController {
  async createBeneficio(req: Request, res: Response) {
    try {
      const beneficioData = req.body;
      const result = await beneficioService.createBeneficio(beneficioData);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: result.message || "Error al crear beneficio",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Beneficio creado exitosamente",
        data: result.beneficio,
        timestamp: new Date(),
      };
      res.status(201).json(response);
    } catch (error) {
      logger.error("Error en BeneficioController.createBeneficio:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async getBeneficioById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: "ID inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await beneficioService.getBeneficioById(id);
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener beneficio",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Beneficio encontrado",
        data: result.beneficio,
        timestamp: new Date(),
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en BeneficioController.getBeneficioById:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async updateBeneficio(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: "ID inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const updateData = req.body;
      const result = await beneficioService.updateBeneficio(id, updateData);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al actualizar beneficio",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Beneficio actualizado exitosamente",
        data: result.beneficio,
        timestamp: new Date(),
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en BeneficioController.updateBeneficio:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async deleteBeneficio(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: "ID inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await beneficioService.deleteBeneficio(id);
      const response: ApiResponse = {
        success: result.success,
        message: result.success ? "Beneficio eliminado correctamente" : "Error eliminando beneficio",
        error: result.error,
        timestamp: new Date(),
      };
      res.status(result.success ? 200 : 404).json(response);
    } catch (error) {
      logger.error("Error en BeneficioController.deleteBeneficio:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async getAllBeneficios(req: Request, res: Response) {
    try {
      const result = await beneficioService.getAllBeneficios();
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener beneficios",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Beneficios obtenidos exitosamente",
        data: result.beneficios,
        timestamp: new Date(),
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en BeneficioController.getAllBeneficios:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }
}

export const beneficioController = new BeneficioController();