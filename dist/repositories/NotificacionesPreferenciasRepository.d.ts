import { NotificacionesUsuarioEntity } from '../models/NotificacionesUsuario.entity';
export declare const NotificacionesPreferenciasRepository: import("typeorm").Repository<NotificacionesUsuarioEntity>;
export declare const findPreferenciasByUsuario: (userId: number) => Promise<NotificacionesUsuarioEntity | null>;
export declare const upsertPreferencias: (userId: number, data: Partial<NotificacionesUsuarioEntity>) => Promise<NotificacionesUsuarioEntity | null>;
