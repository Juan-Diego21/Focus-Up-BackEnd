import { MetodoEstudioCreateInput, MetodoEstudioUpdateInput, MetodoEstudio } from "../types/MetodoEstudio";
export declare class MetodoEstudioService {
    createMetodoEstudio(metodoData: MetodoEstudioCreateInput): Promise<{
        success: boolean;
        metodo?: MetodoEstudio;
        message?: string;
        error?: string;
    }>;
    getMetodoEstudioById(id: number): Promise<{
        success: boolean;
        metodo?: MetodoEstudio;
        error?: string;
    }>;
    updateMetodoEstudio(id: number, updateData: MetodoEstudioUpdateInput): Promise<{
        success: boolean;
        metodo?: MetodoEstudio;
        error?: string;
    }>;
    deleteMetodoEstudio(id: number): Promise<{
        success: boolean;
        error?: string;
    }>;
    getAllMetodosEstudio(): Promise<{
        success: boolean;
        metodos?: MetodoEstudio[];
        error?: string;
    }>;
    getBeneficiosForMetodo(idMetodo: number): Promise<{
        success: boolean;
        beneficios?: any[];
        error?: string;
    }>;
    addBeneficioToMetodo(idMetodo: number, idBeneficio: number): Promise<{
        success: boolean;
        error?: string;
    }>;
    removeBeneficioFromMetodo(idMetodo: number, idBeneficio: number): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare const metodoEstudioService: MetodoEstudioService;
