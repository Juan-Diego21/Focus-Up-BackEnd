import { BeneficioCreateInput, BeneficioUpdateInput, Beneficio } from "../types/Beneficio";
export declare class BeneficioService {
    createBeneficio(beneficioData: BeneficioCreateInput): Promise<{
        success: boolean;
        beneficio?: Beneficio;
        message?: string;
        error?: string;
    }>;
    getBeneficioById(id: number): Promise<{
        success: boolean;
        beneficio?: Beneficio;
        error?: string;
    }>;
    updateBeneficio(id: number, updateData: BeneficioUpdateInput): Promise<{
        success: boolean;
        beneficio?: Beneficio;
        error?: string;
    }>;
    deleteBeneficio(id: number): Promise<{
        success: boolean;
        error?: string;
    }>;
    getAllBeneficios(): Promise<{
        success: boolean;
        beneficios?: Beneficio[];
        error?: string;
    }>;
}
export declare const beneficioService: BeneficioService;
