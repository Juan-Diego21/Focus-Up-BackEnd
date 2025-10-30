import { BeneficioCreateInput, BeneficioUpdateInput, Beneficio } from "../types/Beneficio";
import { beneficioRepository } from "../repositories/BeneficioRepository";
import logger from "../utils/logger";

/**
 * Servicio para la gestión de beneficios de estudio
 * Maneja operaciones CRUD de beneficios asociados a métodos de estudio
 */
export class BeneficioService {
  async createBeneficio(beneficioData: BeneficioCreateInput): Promise<{
    success: boolean;
    beneficio?: Beneficio;
    message?: string;
    error?: string;
  }> {
    try {
      if (!beneficioData.descripcion_beneficio || beneficioData.descripcion_beneficio.trim().length === 0) {
        return {
          success: false,
          error: "La descripción del beneficio es requerida",
        };
      }

      const beneficio = await beneficioRepository.create(beneficioData);
      return { success: true, beneficio };
    } catch (error) {
      logger.error("Error en BeneficioService.createBeneficio:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      };
    }
  }

  async getBeneficioById(id: number): Promise<{ success: boolean; beneficio?: Beneficio; error?: string }> {
    try {
      const beneficio = await beneficioRepository.findById(id);
      if (!beneficio) {
        return { success: false, error: "Beneficio no encontrado" };
      }
      return { success: true, beneficio };
    } catch (error) {
      logger.error("Error en BeneficioService.getBeneficioById:", error);
      return { success: false, error: "Error al obtener beneficio" };
    }
  }

  async updateBeneficio(id: number, updateData: BeneficioUpdateInput): Promise<{
    success: boolean;
    beneficio?: Beneficio;
    error?: string;
  }> {
    try {
      if (updateData.descripcion_beneficio !== undefined && updateData.descripcion_beneficio.trim().length === 0) {
        return {
          success: false,
          error: "La descripción del beneficio no puede estar vacía",
        };
      }

      const beneficio = await beneficioRepository.update(id, updateData);
      if (!beneficio) {
        return { success: false, error: "Beneficio no encontrado" };
      }
      return { success: true, beneficio };
    } catch (error) {
      logger.error("Error en BeneficioService.updateBeneficio:", error);
      return { success: false, error: "Error al actualizar beneficio" };
    }
  }

  async deleteBeneficio(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const deleted = await beneficioRepository.delete(id);
      if (!deleted) {
        return { success: false, error: "Beneficio no encontrado" };
      }
      return { success: true };
    } catch (error) {
      logger.error("Error en BeneficioService.deleteBeneficio:", error);
      return { success: false, error: "Error eliminando beneficio" };
    }
  }

  async getAllBeneficios(): Promise<{
    success: boolean;
    beneficios?: Beneficio[];
    error?: string;
  }> {
    try {
      const beneficios = await beneficioRepository.findAll();
      return { success: true, beneficios };
    } catch (error) {
      logger.error("Error en BeneficioService.getAllBeneficios:", error);
      return { success: false, error: "Error al obtener beneficios" };
    }
  }
}

export const beneficioService = new BeneficioService();