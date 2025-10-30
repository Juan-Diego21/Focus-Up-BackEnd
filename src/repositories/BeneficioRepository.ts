import { Repository } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { BeneficioEntity } from "../models/Beneficio.entity";
import {
  Beneficio,
  BeneficioCreateInput,
  BeneficioUpdateInput,
  IBeneficioRepository,
} from "../types/Beneficio";

/**
 * Repositorio para la gestión de beneficios de estudio
 * Implementa operaciones CRUD básicas para beneficios
 */
export class BeneficioRepository implements IBeneficioRepository {
  private repository: Repository<BeneficioEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(BeneficioEntity);
  }

  async create(beneficioInput: BeneficioCreateInput): Promise<Beneficio> {
    const beneficio = this.repository.create({
      descripcionBeneficio: beneficioInput.descripcion_beneficio,
    });
    const savedBeneficio = await this.repository.save(beneficio);
    return this.mapToBeneficioDTO(savedBeneficio);
  }

  async findById(id: number): Promise<Beneficio | null> {
    const beneficio = await this.repository.findOne({
      where: { idBeneficio: id },
    });
    return beneficio ? this.mapToBeneficioDTO(beneficio) : null;
  }

  async update(id: number, updates: BeneficioUpdateInput): Promise<Beneficio | null> {
    const updateData: any = {};
    if (updates.descripcion_beneficio !== undefined)
      updateData.descripcionBeneficio = updates.descripcion_beneficio;

    const result = await this.repository.update(id, updateData);
    if (result.affected && result.affected > 0) {
      return this.findById(id);
    }
    return null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async findAll(): Promise<Beneficio[]> {
    const beneficios = await this.repository.find();
    return beneficios.map((beneficio) => this.mapToBeneficioDTO(beneficio));
  }

  private mapToBeneficioDTO(entity: BeneficioEntity): Beneficio {
    return {
      id_beneficio: entity.idBeneficio,
      descripcion_beneficio: entity.descripcionBeneficio,
      fecha_creacion: entity.fechaCreacion,
      fecha_actualizacion: entity.fechaActualizacion,
    };
  }
}

export const beneficioRepository = new BeneficioRepository();