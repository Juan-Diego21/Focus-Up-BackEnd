import { Request, Response } from "express";
import { metodoEstudioService } from "../services/MetodoEstudioService";
import { ApiResponse } from "../types/ApiResponse";
import logger from "../utils/logger";

/**
 * Controlador para la gestión de métodos de estudio
 * Maneja operaciones CRUD de métodos de estudio y sus asociaciones con beneficios
 */
export class MetodoEstudioController {
  async createMetodoEstudio(req: Request, res: Response) {
    try {
      const metodoData = req.body;
      const result = await metodoEstudioService.createMetodoEstudio(metodoData);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: result.message || "Error al crear método de estudio",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Método de estudio creado exitosamente",
        data: result.metodo,
        timestamp: new Date(),
      };
      res.status(201).json(response);
    } catch (error) {
      logger.error("Error en MetodoEstudioController.createMetodoEstudio:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async getMetodoEstudioById(req: Request, res: Response) {
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

      const result = await metodoEstudioService.getMetodoEstudioById(id);
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener método de estudio",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Método de estudio encontrado",
        data: result.metodo,
        timestamp: new Date(),
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en MetodoEstudioController.getMetodoEstudioById:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async updateMetodoEstudio(req: Request, res: Response) {
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
      const result = await metodoEstudioService.updateMetodoEstudio(id, updateData);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al actualizar método de estudio",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Método de estudio actualizado exitosamente",
        data: result.metodo,
        timestamp: new Date(),
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en MetodoEstudioController.updateMetodoEstudio:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async deleteMetodoEstudio(req: Request, res: Response) {
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

      const result = await metodoEstudioService.deleteMetodoEstudio(id);
      const response: ApiResponse = {
        success: result.success,
        message: result.success ? "Método de estudio eliminado correctamente" : "Error eliminando método de estudio",
        error: result.error,
        timestamp: new Date(),
      };
      res.status(result.success ? 200 : 404).json(response);
    } catch (error) {
      logger.error("Error en MetodoEstudioController.deleteMetodoEstudio:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async getAllMetodosEstudio(req: Request, res: Response) {
    try {
      const result = await metodoEstudioService.getAllMetodosEstudio();
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener métodos de estudio",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Métodos de estudio obtenidos exitosamente",
        data: result.metodos,
        timestamp: new Date(),
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en MetodoEstudioController.getAllMetodosEstudio:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async getBeneficiosForMetodo(req: Request, res: Response) {
    try {
      const idMetodo = parseInt(req.params.id);
      if (isNaN(idMetodo)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de método inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await metodoEstudioService.getBeneficiosForMetodo(idMetodo);
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
      logger.error("Error en MetodoEstudioController.getBeneficiosForMetodo:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async addBeneficioToMetodo(req: Request, res: Response) {
    try {
      const idMetodo = parseInt(req.params.id_metodo);
      const idBeneficio = parseInt(req.params.id_beneficio);
      if (isNaN(idMetodo) || isNaN(idBeneficio)) {
        const response: ApiResponse = {
          success: false,
          message: "IDs inválidos",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await metodoEstudioService.addBeneficioToMetodo(idMetodo, idBeneficio);
      const response: ApiResponse = {
        success: result.success,
        message: result.success ? "Beneficio asociado correctamente" : "Error asociando beneficio",
        error: result.error,
        timestamp: new Date(),
      };
      res.status(result.success ? 200 : 400).json(response);
    } catch (error) {
      logger.error("Error en MetodoEstudioController.addBeneficioToMetodo:", error);
      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  }

  async removeBeneficioFromMetodo(req: Request, res: Response) {
    try {
      const idMetodo = parseInt(req.params.id_metodo);
      const idBeneficio = parseInt(req.params.id_beneficio);
      if (isNaN(idMetodo) || isNaN(idBeneficio)) {
        const response: ApiResponse = {
          success: false,
          message: "IDs inválidos",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await metodoEstudioService.removeBeneficioFromMetodo(idMetodo, idBeneficio);
      const response: ApiResponse = {
        success: result.success,
        message: result.success ? "Beneficio removido correctamente" : "Error removiendo beneficio",
        error: result.error,
        timestamp: new Date(),
      };
      res.status(result.success ? 200 : 404).json(response);
    } catch (error) {
      logger.error("Error en MetodoEstudioController.removeBeneficioFromMetodo:", error);
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

export const metodoEstudioController = new MetodoEstudioController();