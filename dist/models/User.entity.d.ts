import { UsuarioInteresesEntity } from "./UsuarioIntereses.entity";
import { UsuarioDistraccionesEntity } from "./UsuarioDistracciones.entity";
import { EventoEntity } from "./Evento.entity";
export declare class UserEntity {
    idUsuario: number;
    nombreUsuario: string;
    pais: string;
    genero: string;
    fechaNacimiento: Date;
    horarioFav: string;
    correo: string;
    contrasena: string;
    idObjetivoEstudio: number;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tokenVersion: number;
    usuarioIntereses?: UsuarioInteresesEntity[];
    usuarioDistracciones?: UsuarioDistraccionesEntity[];
    eventos?: EventoEntity[];
}
