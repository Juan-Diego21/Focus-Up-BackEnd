import { UserEntity } from "./User.entity";
import { MusicaEntity } from "./Musica.entity";
import { MetodoRealizadoEntity } from "./MetodoRealizado.entity";
export declare enum SesionEstado {
    PENDIENTE = "pendiente",
    EN_PROCESO = "en_proceso",
    COMPLETADA = "completada",
    CANCELADA = "cancelada",
    IN_PROCESS = "in_process",
    COMPLETED = "completed",
    EN_PROCESO_MM = "En_proceso",
    CASI_TERMINANDO = "Casi_terminando",
    TERMINADO = "Terminado"
}
export declare class SesionConcentracionRealizadaEntity {
    idSesionRealizada: number;
    idUsuario: number;
    idMetodoRealizado: number;
    idCancion: number;
    fechaProgramada: Date;
    estado: SesionEstado;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    usuario?: UserEntity;
    metodoRealizado?: MetodoRealizadoEntity;
    musica?: MusicaEntity;
}
