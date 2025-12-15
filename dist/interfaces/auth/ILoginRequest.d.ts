export interface ILoginRequest {
    identifier: string;
    password: string;
}
export interface ILoginResponse {
    user: {
        id_usuario: number;
        nombre_usuario: string;
        correo: string;
    };
    token: string;
    refreshToken?: string;
}
