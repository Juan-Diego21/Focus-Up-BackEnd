import { User, UserCreateInput } from '../types/User';
export declare class UserModel {
    id_usuario?: number | undefined;
    nombre_usuario: string;
    pais: string;
    genero: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir';
    fecha_nacimiento: Date;
    horario_fav: string;
    correo: string;
    contrasena: string;
    id_objetivo_estudio?: number | undefined;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    constructor(id_usuario?: number | undefined, nombre_usuario?: string, pais?: string, genero?: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir', fecha_nacimiento?: Date, horario_fav?: string, correo?: string, contrasena?: string, id_objetivo_estudio?: number | undefined, fecha_creacion?: Date, fecha_actualizacion?: Date);
    static isValidAge(fechaNacimiento: Date): boolean;
    static fromInput(input: UserCreateInput): UserModel;
    toJSON(): User;
}
