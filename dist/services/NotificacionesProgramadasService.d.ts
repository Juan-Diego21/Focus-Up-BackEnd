import { ICreateScheduledNotification } from '../interfaces/domain/notifications/ICreateScheduledNotification';
export declare const NotificacionesProgramadasService: {
    createScheduledNotification(data: ICreateScheduledNotification): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: import("../models/NotificacionesProgramadas.entity").NotificacionesProgramadasEntity;
        error?: undefined;
    }>;
    getPendingNotifications(): Promise<{
        success: boolean;
        data: import("../models/NotificacionesProgramadas.entity").NotificacionesProgramadasEntity[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    getUpcomingEventsWithNotifications(userId: number): Promise<{
        success: boolean;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    markAsSent(idNotificacion: number): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    scheduleWeeklyMotivationalEmails(): Promise<{
        success: boolean;
        message: string;
        data: {
            programadas: number;
            errores: number;
            semana: number;
            mensaje: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message?: undefined;
        data?: undefined;
    }>;
};
