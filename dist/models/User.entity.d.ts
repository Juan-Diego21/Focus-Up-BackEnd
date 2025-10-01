import { UsuarioInteresesEntity } from "./UsuarioIntereses.entity";
import { UsuarioDistraccionesEntity } from "./UsuarioDistracciones.entity";
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
    usuarioIntereses?: UsuarioInteresesEntity[];
    usuarioDistracciones?: UsuarioDistraccionesEntity[];
}
