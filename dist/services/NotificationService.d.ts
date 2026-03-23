import { NotificacionesProgramadasEntity } from "../models/NotificacionesProgramadas.entity";
export declare class NotificationService {
    private notificationRepository;
    private userRepository;
    private sessionRepository;
    private preferencesRepository;
    createScheduledNotification({ userId, sessionId, title, message, scheduledAt }: {
        userId: number;
        sessionId: number;
        title: string;
        message: string;
        scheduledAt: Date;
    }): Promise<NotificacionesProgramadasEntity>;
    checkDuplicateScheduledNotification(sessionId: number, weekStart: Date): Promise<boolean>;
    processPendingNotifications(): Promise<void>;
}
