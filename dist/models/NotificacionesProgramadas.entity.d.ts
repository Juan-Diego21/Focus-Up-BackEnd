import { UserEntity } from "./User.entity";
export declare class NotificacionesProgramadasEntity {
    idNotificacion: number;
    usuario: UserEntity;
    idUsuario: number;
    tipo: string;
    titulo?: string;
    mensaje?: string;
    fechaProgramada: Date;
    enviada: boolean;
    fechaEnvio?: Date;
}
