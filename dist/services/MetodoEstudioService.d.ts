import { MetodoEstudio } from '../models/MedotoEstudio.entity';
export declare const MetodoEstudioService: {
    getMetodoById(idMetodo: number): Promise<{
        success: boolean;
        error: string;
        metodo?: undefined;
    } | {
        success: boolean;
        metodo: MetodoEstudio;
        error?: undefined;
    }>;
    getMetodoByname(nombreMetodo: string): Promise<{
        success: boolean;
        error: string;
    } | undefined>;
    getMetodoList(): Promise<{
        success: boolean;
        data: MetodoEstudio[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
};
export default MetodoEstudioService;
