import { MetodoEstudio, MetodoEstudioCreateInput, MetodoEstudioUpdateInput, IMetodoEstudioRepository } from "../types/MetodoEstudio";
export declare class MetodoEstudioRepository implements IMetodoEstudioRepository {
    private repository;
    private beneficioRepository;
    private metodoBeneficiosRepository;
    constructor();
    create(metodoInput: MetodoEstudioCreateInput): Promise<MetodoEstudio>;
    findById(id: number): Promise<MetodoEstudio | null>;
    update(id: number, updates: MetodoEstudioUpdateInput): Promise<MetodoEstudio | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<MetodoEstudio[]>;
    addBeneficio(idMetodo: number, idBeneficio: number): Promise<boolean>;
    removeBeneficio(idMetodo: number, idBeneficio: number): Promise<boolean>;
    getBeneficios(idMetodo: number): Promise<any[]>;
    private mapToMetodoEstudioDTO;
}
export declare const metodoEstudioRepository: MetodoEstudioRepository;
