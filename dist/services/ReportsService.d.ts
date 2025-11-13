import { MetodoRealizadoEntity, MetodoProgreso } from "../models/MetodoRealizado.entity";
import { SesionConcentracionRealizadaEntity, SesionEstado } from "../models/SesionConcentracionRealizada.entity";
export interface CreateActiveMethodData {
    idMetodo: number;
    estado?: string;
    progreso?: number;
    idUsuario: number;
}
export interface UpdateMethodProgressData {
    progreso?: MetodoProgreso;
    finalizar?: boolean;
}
export interface UpdateSessionProgressData {
    estado?: SesionEstado;
}
export interface ReportData {
    metodos: any[];
    sesiones: any[];
}
export declare class ReportsService {
    private metodoRealizadoRepository;
    private sesionRealizadaRepository;
    private userRepository;
    private metodoRepository;
    private musicaRepository;
    createActiveMethod(data: CreateActiveMethodData): Promise<{
        success: boolean;
        metodoRealizado?: MetodoRealizadoEntity;
        message?: string;
        error?: string;
    }>;
    getUserReports(userId: number): Promise<{
        success: boolean;
        reports?: ReportData;
        error?: string;
    }>;
    updateMethodProgress(methodId: number, userId: number, data: UpdateMethodProgressData): Promise<{
        success: boolean;
        metodoRealizado?: MetodoRealizadoEntity;
        message?: string;
        error?: string;
    }>;
    updateSessionProgress(sessionId: number, userId: number, data: UpdateSessionProgressData): Promise<{
        success: boolean;
        sesionRealizada?: SesionConcentracionRealizadaEntity;
        message?: string;
        error?: string;
    }>;
    getMethodById(methodId: number, userId: number): Promise<{
        success: boolean;
        metodoRealizado?: MetodoRealizadoEntity;
        error?: string;
    }>;
    getSessionById(sessionId: number, userId: number): Promise<{
        success: boolean;
        sesionRealizada?: SesionConcentracionRealizadaEntity;
        error?: string;
    }>;
    deleteReport(reportId: number, userId: number): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
}
export declare const reportsService: ReportsService;
