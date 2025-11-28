import { Repository } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { CodigosVerificacionEntity } from "../models/CodigosVerificacion.entity";
import {
  CodigosVerificacion,
  CodigosVerificacionCreateInput,
  ICodigosVerificacionRepository,
} from "../types/CodigosVerificacion";
import logger from "../utils/logger";

/**
 * Repositorio para la gestión de códigos de verificación en la base de datos
 * Implementa operaciones CRUD y consultas específicas para códigos de verificación
 */
export class CodigosVerificacionRepository implements ICodigosVerificacionRepository {
  private repository: Repository<CodigosVerificacionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CodigosVerificacionEntity);
  }

  async createVerificationCode(data: CodigosVerificacionCreateInput): Promise<CodigosVerificacion> {
    try {
      const code = this.repository.create({
        email: data.email.toLowerCase(),
        codigo: data.codigo,
        expiraEn: data.expiraEn,
        intentos: 0,
      });

      const savedCode = await this.repository.save(code);
      logger.info(`Código de verificación creado para email: ${data.email}`);
      return this.mapToDTO(savedCode);
    } catch (error) {
      logger.error("Error en CodigosVerificacionRepository.createVerificationCode:", error);
      throw error;
    }
  }

  async findByEmailAndCode(email: string, codigo: string): Promise<CodigosVerificacion | null> {
    try {
      const code = await this.repository.findOne({
        where: {
          email: email.toLowerCase(),
          codigo: codigo,
        },
      });

      return code ? this.mapToDTO(code) : null;
    } catch (error) {
      logger.error("Error en CodigosVerificacionRepository.findByEmailAndCode:", error);
      return null;
    }
  }

  async findActiveByEmail(email: string): Promise<CodigosVerificacion | null> {
    try {
      const code = await this.repository
        .createQueryBuilder("code")
        .where("code.email = :email", { email: email.toLowerCase() })
        .andWhere("code.expira_en > :now", { now: new Date() })
        .orderBy("code.fecha_creacion", "DESC")
        .getOne();

      return code ? this.mapToDTO(code) : null;
    } catch (error) {
      logger.error("Error en CodigosVerificacionRepository.findActiveByEmail:", error);
      return null;
    }
  }

  async incrementAttempts(id: number): Promise<boolean> {
    try {
      const result = await this.repository.increment({ id: id }, "intentos", 1);
      logger.info(`Intentos incrementados para código ID: ${id}`);
      return true;
    } catch (error) {
      logger.error("Error en CodigosVerificacionRepository.incrementAttempts:", error);
      return false;
    }
  }

  async deleteByEmail(email: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({ email: email.toLowerCase() });
      const deleted = !!(result.affected && result.affected > 0);
      if (deleted) {
        logger.info(`Códigos de verificación eliminados para email: ${email}`);
      }
      return deleted;
    } catch (error) {
      logger.error("Error en CodigosVerificacionRepository.deleteByEmail:", error);
      return false;
    }
  }

  async cleanupExpiredCodes(): Promise<number> {
    try {
      const result = await this.repository
        .createQueryBuilder()
        .delete()
        .from(CodigosVerificacionEntity)
        .where("expira_en < :now", { now: new Date() })
        .execute();

      const deletedCount = result.affected || 0;
      logger.info(`Códigos expirados eliminados: ${deletedCount}`);
      return deletedCount;
    } catch (error) {
      logger.error("Error en CodigosVerificacionRepository.cleanupExpiredCodes:", error);
      return 0;
    }
  }

  isCodeExpired(expiraEn: Date): boolean {
    return expiraEn < new Date();
  }

  private mapToDTO(entity: CodigosVerificacionEntity): CodigosVerificacion {
    return {
      id: entity.id,
      email: entity.email,
      codigo: entity.codigo,
      fechaCreacion: entity.fechaCreacion,
      expiraEn: entity.expiraEn,
      intentos: entity.intentos,
      maxIntentos: entity.maxIntentos,
    };
  }
}

// Exportar con tipo específico
export const codigosVerificacionRepository: ICodigosVerificacionRepository = new CodigosVerificacionRepository();