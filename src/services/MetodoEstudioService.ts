import { MetodoEstudioCreateInput, MetodoEstudioUpdateInput, MetodoEstudio } from "../types/MetodoEstudio";
import { metodoEstudioRepository } from "../repositories/MetodoEstudioRepository";
import logger from "../utils/logger";

/**
 * Servicio para la gestión de métodos de estudio
 * Maneja operaciones CRUD de métodos de estudio y sus asociaciones con beneficios
 */
export class MetodoEstudioService {
  async createMetodoEstudio(metodoData: MetodoEstudioCreateInput): Promise<{
    success: boolean;
    metodo?: MetodoEstudio;
    message?: string;
    error?: string;
  }> {
    try {
      if (!metodoData.nombre_metodo || metodoData.nombre_metodo.trim().length === 0) {
        return {
          success: false,
          error: "El nombre del método de estudio es requerido",
        };
      }

      const metodo = await metodoEstudioRepository.create(metodoData);
      return { success: true, metodo };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.createMetodoEstudio:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      };
    }
  }

  async getMetodoEstudioById(id: number): Promise<{ success: boolean; metodo?: MetodoEstudio; error?: string }> {
    try {
      const metodo = await metodoEstudioRepository.findById(id);
      if (!metodo) {
        return { success: false, error: "Método de estudio no encontrado" };
      }
      return { success: true, metodo };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.getMetodoEstudioById:", error);
      return { success: false, error: "Error al obtener método de estudio" };
    }
  }

  async updateMetodoEstudio(id: number, updateData: MetodoEstudioUpdateInput): Promise<{
    success: boolean;
    metodo?: MetodoEstudio;
    error?: string;
  }> {
    try {
      if (updateData.nombre_metodo !== undefined && updateData.nombre_metodo.trim().length === 0) {
        return {
          success: false,
          error: "El nombre del método de estudio no puede estar vacío",
        };
      }

      const metodo = await metodoEstudioRepository.update(id, updateData);
      if (!metodo) {
        return { success: false, error: "Método de estudio no encontrado" };
      }
      return { success: true, metodo };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.updateMetodoEstudio:", error);
      return { success: false, error: "Error al actualizar método de estudio" };
    }
  }

  async deleteMetodoEstudio(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const deleted = await metodoEstudioRepository.delete(id);
      if (!deleted) {
        return { success: false, error: "Método de estudio no encontrado" };
      }
      return { success: true };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.deleteMetodoEstudio:", error);
      return { success: false, error: "Error eliminando método de estudio" };
    }
  }

  async getAllMetodosEstudio(): Promise<{
    success: boolean;
    metodos?: MetodoEstudio[];
    error?: string;
  }> {
    try {
      const metodos = await metodoEstudioRepository.findAll();
      return { success: true, metodos };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.getAllMetodosEstudio:", error);
      return { success: false, error: "Error al obtener métodos de estudio" };
    }
  }

  async getBeneficiosForMetodo(idMetodo: number): Promise<{
    success: boolean;
    beneficios?: any[];
    error?: string;
  }> {
    try {
      const beneficios = await metodoEstudioRepository.getBeneficios(idMetodo);
      return { success: true, beneficios };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.getBeneficiosForMetodo:", error);
      return { success: false, error: "Error al obtener beneficios" };
    }
  }

  async addBeneficioToMetodo(idMetodo: number, idBeneficio: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const added = await metodoEstudioRepository.addBeneficio(idMetodo, idBeneficio);
      if (!added) {
        return { success: false, error: "Método o beneficio no encontrado, o ya asociado" };
      }
      return { success: true };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.addBeneficioToMetodo:", error);
      return { success: false, error: "Error asociando beneficio" };
    }
  }

  async removeBeneficioFromMetodo(idMetodo: number, idBeneficio: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const removed = await metodoEstudioRepository.removeBeneficio(idMetodo, idBeneficio);
      if (!removed) {
        return { success: false, error: "Asociación no encontrada" };
      }
      return { success: true };
    } catch (error) {
      logger.error("Error en MetodoEstudioService.removeBeneficioFromMetodo:", error);
      return { success: false, error: "Error removiendo beneficio" };
    }
  }
}

export const metodoEstudioService = new MetodoEstudioService();
