import { MusicaEntity } from "./Musica.entity";
import { MetodoRealizadoEntity } from "./MetodoRealizado.entity";
export declare enum SesionEstado {
    PENDIENTE = "pendiente",
    EN_PROCESO = "en_proceso",
    COMPLETADA = "completada",
    CANCELADA = "cancelada"
}
export declare class SesionConcentracionRealizadaEntity {
    idSesionRealizada: number;
    idMetodoRealizado: number;
    idCancion: number;
    fechaProgramada: Date;
    estado: SesionEstado;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    metodoRealizado?: MetodoRealizadoEntity;
    musica?: MusicaEntity;
}
