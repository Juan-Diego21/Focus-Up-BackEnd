import { NotificacionesProgramadasEntity } from "../models/NotificacionesProgramadas.entity";
export interface SessionNotificationScheduleResult {
    success: boolean;
    data?: NotificacionesProgramadasEntity;
    skippedByPreference?: boolean;
    duplicated?: boolean;
    error?: string;
    message?: string;
}
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly userRepository;
    private readonly sessionRepository;
    private readonly preferencesRepository;
    private buildWeekBounds;
    private findWeeklyDuplicate;
    createScheduledNotification({ userId, sessionId, title, message, scheduledAt, }: {
        userId: number;
        sessionId: number;
        title: string;
        message: string;
        scheduledAt: Date;
    }): Promise<SessionNotificationScheduleResult>;
    checkDuplicateScheduledNotification(sessionId: number, weekStart: Date): Promise<boolean>;
    processPendingNotifications(): Promise<void>;
}
