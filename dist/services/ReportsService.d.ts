import { MetodoRealizadoEntity } from "../models/MetodoRealizado.entity";
import { ICreateActiveMethod } from "../interfaces/domain/reports/ICreateActiveMethod";
import { IUpdateMethodProgress } from "../interfaces/domain/reports/IUpdateMethodProgress";
import { IUpdateSessionProgress } from "../interfaces/domain/reports/IUpdateSessionProgress";
import { IReportData } from "../interfaces/domain/reports/IReportData";
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
    createActiveMethod(data: ICreateActiveMethod): Promise<{
        success: boolean;
        metodoRealizado?: MetodoRealizadoEntity;
        message?: string;
        error?: string;
    }>;
    getUserReports(userId: number): Promise<{
        success: boolean;
        reports?: IReportData;
        error?: string;
    }>;
    updateMethodProgress(methodId: number, userId: number, data: IUpdateMethodProgress): Promise<{
        success: boolean;
        metodoRealizado?: MetodoRealizadoEntity;
        message?: string;
        error?: string;
    }>;
    updateSessionProgress(sessionId: number, userId: number, data: IUpdateSessionProgress): Promise<{
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
