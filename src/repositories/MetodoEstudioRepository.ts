import { Repository } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { MetodoEstudioEntity } from "../models/MetodoEstudio.entity";
import { BeneficioEntity } from "../models/Beneficio.entity";
import { MetodoBeneficiosEntity } from "../models/MetodoBeneficios.entity";
import {
  MetodoEstudio,
  MetodoEstudioCreateInput,
  MetodoEstudioUpdateInput,
  IMetodoEstudioRepository,
} from "../types/MetodoEstudio";

/**
 * Repositorio para la gestión de métodos de estudio
 * Maneja operaciones CRUD y asociaciones con beneficios
 */
export class MetodoEstudioRepository implements IMetodoEstudioRepository {
  private repository: Repository<MetodoEstudioEntity>;
  private beneficioRepository: Repository<BeneficioEntity>;
  private metodoBeneficiosRepository: Repository<MetodoBeneficiosEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(MetodoEstudioEntity);
    this.beneficioRepository = AppDataSource.getRepository(BeneficioEntity);
    this.metodoBeneficiosRepository = AppDataSource.getRepository(
      MetodoBeneficiosEntity
    );
  }

  async create(metodoInput: MetodoEstudioCreateInput): Promise<MetodoEstudio> {
    const metodo = this.repository.create({
      nombreMetodo: metodoInput.nombre_metodo,
      descripcion: metodoInput.descripcion,
    });
    const savedMetodo = await this.repository.save(metodo);
    return this.mapToMetodoEstudioDTO(savedMetodo);
  }

  async findById(id: number): Promise<MetodoEstudio | null> {
    const metodo = await this.repository.findOne({
      where: { idMetodo: id },
      relations: ["beneficios"],
    });
    return metodo ? this.mapToMetodoEstudioDTO(metodo) : null;
  }

  async update(
    id: number,
    updates: MetodoEstudioUpdateInput
  ): Promise<MetodoEstudio | null> {
    const updateData: any = {};
    if (updates.nombre_metodo !== undefined)
      updateData.nombreMetodo = updates.nombre_metodo;
    if (updates.descripcion !== undefined)
      updateData.descripcion = updates.descripcion;

    const result = await this.repository.update(id, updateData);
    if (result.affected && result.affected > 0) {
      return this.findById(id);
    }
    return null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }

  async findAll(): Promise<MetodoEstudio[]> {
    const metodos = await this.repository.find({
      relations: ["beneficios"],
    });
    return metodos.map((metodo) => this.mapToMetodoEstudioDTO(metodo));
  }

  async addBeneficio(idMetodo: number, idBeneficio: number): Promise<boolean> {
    const metodo = await this.repository.findOne({ where: { idMetodo } });
    const beneficio = await this.beneficioRepository.findOne({
      where: { idBeneficio },
    });
    if (!metodo || !beneficio) return false;

    const existing = await this.metodoBeneficiosRepository.findOne({
      where: { idMetodo, idBeneficio },
    });
    if (existing) return true; 

    const association = this.metodoBeneficiosRepository.create({
      idMetodo,
      idBeneficio,
    });
    await this.metodoBeneficiosRepository.save(association);
    return true;
  }

  async removeBeneficio(
    idMetodo: number,
    idBeneficio: number
  ): Promise<boolean> {
    const result = await this.metodoBeneficiosRepository.delete({
      idMetodo,
      idBeneficio,
    });
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }

  async getBeneficios(idMetodo: number): Promise<any[]> {
    const metodo = await this.repository.findOne({
      where: { idMetodo },
      relations: ["beneficios"],
    });
    if (!metodo || !metodo.beneficios) return [];
    return metodo.beneficios.map((b) => ({
      id_beneficio: b.idBeneficio,
      descripcion_beneficio: b.descripcionBeneficio,
      fecha_creacion: b.fechaCreacion,
      fecha_actualizacion: b.fechaActualizacion,
    }));
  }

  private mapToMetodoEstudioDTO(entity: MetodoEstudioEntity): any {
    return {
      id_metodo: entity.idMetodo,
      nombre_metodo: entity.nombreMetodo,
      descripcion: entity.descripcion,
      fecha_creacion: entity.fechaCreacion,
      fecha_actualizacion: entity.fechaActualizacion,
      beneficios: entity.beneficios
        ? entity.beneficios.map((b) => ({
            id_beneficio: b.idBeneficio,
            descripcion_beneficio: b.descripcionBeneficio,
            fecha_creacion: b.fechaCreacion,
            fecha_actualizacion: b.fechaActualizacion,
          }))
        : [],
    };
  }
}

export const metodoEstudioRepository = new MetodoEstudioRepository();
