import { UserEntity } from "./User.entity";
export declare class NotificacionesUsuarioEntity {
    idUsuario: number;
    usuario: UserEntity;
    eventos: boolean;
    metodosPendientes: boolean;
    sesionesPendientes: boolean;
    motivacion: boolean;
    fechaActualizacion: Date;
}
