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
        data: ({
            type: string;
            idEvento: any;
            nombreEvento: any;
            fechaEvento: any;
            horaEvento: any;
            descripcionEvento: any;
            estado: any;
            metodoEstudio: {
                idMetodo: any;
                nombreMetodo: any;
            } | null;
            album: {
                idAlbum: any;
                nombreAlbum: any;
            } | null;
            notificationTime: string;
            notificationRule: string;
            idReporte?: undefined;
            nombreMetodo?: undefined;
            progreso?: undefined;
            templateId?: undefined;
        } | {
            type: string;
            idReporte: any;
            nombreMetodo: any;
            progreso: any;
            notificationTime: string;
            idEvento?: undefined;
            nombreEvento?: undefined;
            fechaEvento?: undefined;
            horaEvento?: undefined;
            descripcionEvento?: undefined;
            estado?: undefined;
            metodoEstudio?: undefined;
            album?: undefined;
            notificationRule?: undefined;
            templateId?: undefined;
        } | {
            type: string;
            notificationTime: string;
            templateId: number;
            idEvento?: undefined;
            nombreEvento?: undefined;
            fechaEvento?: undefined;
            horaEvento?: undefined;
            descripcionEvento?: undefined;
            estado?: undefined;
            metodoEstudio?: undefined;
            album?: undefined;
            notificationRule?: undefined;
            idReporte?: undefined;
            nombreMetodo?: undefined;
            progreso?: undefined;
        })[];
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
