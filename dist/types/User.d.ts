export interface User {
    id_usuario?: number;
    nombre_usuario: string;
    pais?: string;
    genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir";
    fecha_nacimiento: Date;
    horario_fav?: string;
    correo: string;
    contrasena: string;
    id_objetivo_estudio?: number;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
}
export interface UserCreateInput {
    nombre_usuario: string;
    pais?: string;
    genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir";
    fecha_nacimiento: Date;
    horario_fav?: string;
    correo: string;
    contrasena: string;
    id_objetivo_estudio?: number;
}
export interface UserUpdateInput {
    nombre_usuario?: string;
    pais?: string;
    genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir";
    fecha_nacimiento?: Date;
    horario_fav?: string;
    correo?: string;
    contrasena?: string;
    id_objetivo_estudio?: number;
}
export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
