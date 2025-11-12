import { UserEntity } from "./User.entity";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
export declare enum MetodoProgreso {
    INICIADO = 0,
    MITAD = 50,
    COMPLETADO = 100
}
export declare enum MetodoEstado {
    EN_PROGRESO = "en_progreso",
    COMPLETADO = "completado",
    CANCELADO = "cancelado"
}
export declare class MetodoRealizadoEntity {
    idMetodoRealizado: number;
    idUsuario: number;
    idMetodo: number;
    progreso: MetodoProgreso;
    estado: MetodoEstado;
    fechaInicio: Date;
    fechaFin: Date;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    usuario?: UserEntity;
    metodo?: MetodoEstudioEntity;
}
