export interface Beneficio {
    id_beneficio?: number;
    descripcion_beneficio: string;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
}
export interface BeneficioCreateInput {
    descripcion_beneficio: string;
}
export interface BeneficioUpdateInput {
    descripcion_beneficio?: string;
}
export interface IBeneficioRepository {
    create(beneficioInput: BeneficioCreateInput): Promise<Beneficio>;
    findById(id: number): Promise<Beneficio | null>;
    update(id: number, updates: BeneficioUpdateInput): Promise<Beneficio | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<Beneficio[]>;
}
