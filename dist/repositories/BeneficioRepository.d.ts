import { Beneficio, BeneficioCreateInput, BeneficioUpdateInput, IBeneficioRepository } from "../types/Beneficio";
export declare class BeneficioRepository implements IBeneficioRepository {
    private repository;
    constructor();
    create(beneficioInput: BeneficioCreateInput): Promise<Beneficio>;
    findById(id: number): Promise<Beneficio | null>;
    update(id: number, updates: BeneficioUpdateInput): Promise<Beneficio | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<Beneficio[]>;
    private mapToBeneficioDTO;
}
export declare const beneficioRepository: BeneficioRepository;
