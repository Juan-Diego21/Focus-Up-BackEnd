import { MetodoRealizadoEntity, MetodoProgreso } from "../models/MetodoRealizado.entity";
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
    status?: "completed" | "pending";
    elapsedMs?: number;
    notes?: string;
}
export interface ReportItem {
    id_reporte: number;
    id_usuario: number;
    nombre_metodo: string;
    progreso?: number;
    estado: string;
    fecha_creacion: Date;
}
export interface ReportData {
    metodos: any[];
    sesiones: any[];
    combined: ReportItem[];
}
export declare class ReportsService {
    private metodoRealizadoRepository;
    private sesionRepository;
    private userRepository;
    private metodoRepository;
    private musicaRepository;
    getResumeInfo(methodType: string, progress: number): {
        route: string;
        currentStep?: number;
        progress: number;
        methodType: string;
    };
    getUserSessionReports(userId: number): Promise<{
        success: boolean;
        sessions?: any[];
        error?: string;
    }>;
    getUserMethodReports(userId: number): Promise<{
        success: boolean;
        methods?: any[];
        error?: string;
    }>;
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
        session?: any;
        message?: string;
        error?: string;
    }>;
    private intervalToMs;
    getMethodById(methodId: number, userId: number): Promise<{
        success: boolean;
        metodoRealizado?: MetodoRealizadoEntity;
        error?: string;
    }>;
    getSessionById(sessionId: number, userId: number): Promise<{
        success: boolean;
        session?: any;
        error?: string;
    }>;
    deleteReport(reportId: number, userId: number): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
}
export declare const reportsService: ReportsService;
