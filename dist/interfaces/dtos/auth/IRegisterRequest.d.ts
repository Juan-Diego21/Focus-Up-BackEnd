export interface IRegisterRequest {
    nombre_usuario: string;
    correo: string;
    contrasena: string;
    pais?: string;
    genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir";
    fecha_nacimiento?: Date;
    horario_fav?: string;
    intereses?: number[];
    distracciones?: number[];
}
export interface IRegisterResponse {
    user: {
        id_usuario: number;
        nombre_usuario: string;
        correo: string;
        fecha_creacion: Date;
    };
    message: string;
}
