import { NotificacionesProgramadasEntity } from '../models/NotificacionesProgramadas.entity';
export declare const NotificacionesProgramadasRepository: import("typeorm").Repository<NotificacionesProgramadasEntity>;
export declare const createScheduledNotification: (data: Partial<NotificacionesProgramadasEntity>) => Promise<NotificacionesProgramadasEntity>;
export declare const getPendingNotifications: () => Promise<NotificacionesProgramadasEntity[]>;
export declare const markAsSent: (idNotificacion: number) => Promise<boolean | 0 | undefined>;
