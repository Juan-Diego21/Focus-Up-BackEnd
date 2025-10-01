export interface MetodoEstudio {
  id_metodo?: number;
  nombre_metodo: string;
  descripcion?: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface MetodoEstudioCreateInput {
  nombre_metodo: string;
  descripcion?: string;
}

export interface MetodoEstudioUpdateInput {
  nombre_metodo?: string;
  descripcion?: string;
}

export interface IMetodoEstudioRepository {
  create(metodoInput: MetodoEstudioCreateInput): Promise<MetodoEstudio>;
  findById(id: number): Promise<MetodoEstudio | null>;
  update(id: number, updates: MetodoEstudioUpdateInput): Promise<MetodoEstudio | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<MetodoEstudio[]>;
  addBeneficio(idMetodo: number, idBeneficio: number): Promise<boolean>;
  removeBeneficio(idMetodo: number, idBeneficio: number): Promise<boolean>;
  getBeneficios(idMetodo: number): Promise<any[]>;
}