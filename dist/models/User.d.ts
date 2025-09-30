import { User, UserCreateInput } from '../types/User';
export declare class UserModel {
    id_usuario?: number | undefined;
    nombre_usuario: string;
    pais?: string | undefined;
    genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir" | undefined;
    fecha_nacimiento?: Date | undefined;
    horario_fav?: string | undefined;
    correo: string;
    contrasena: string;
    intereses?: number[] | undefined;
    distracciones?: number[] | undefined;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    constructor(id_usuario?: number | undefined, nombre_usuario?: string, pais?: string | undefined, genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir" | undefined, fecha_nacimiento?: Date | undefined, horario_fav?: string | undefined, correo?: string, contrasena?: string, intereses?: number[] | undefined, distracciones?: number[] | undefined, fecha_creacion?: Date, fecha_actualizacion?: Date);
    static fromInput(input: UserCreateInput): UserModel;
    toJSON(): User;
}
