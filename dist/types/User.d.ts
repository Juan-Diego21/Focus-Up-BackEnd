export interface User {
    id_usuario?: number;
    nombre_usuario: string;
    pais?: string;
    genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir";
    fecha_nacimiento?: Date;
    horario_fav?: string;
    correo: string;
    contrasena: string;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    intereses?: number[];
    distracciones?: number[];
}
export interface UserCreateInput {
    nombre_usuario: string;
    pais?: string;
    genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir";
    fecha_nacimiento?: Date;
    horario_fav?: string;
    correo: string;
    contrasena: string;
    intereses?: number[];
    distracciones?: number[];
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
export interface IUserRepository {
    create(userInput: UserCreateInput): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    update(id: number, updates: UserUpdateInput): Promise<User | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<User[]>;
    emailExists(email: string, excludeUserId?: number): Promise<boolean>;
    usernameExists(username: string, excludeUserId?: number): Promise<boolean>;
    updatePassword(userId: number, hashedPassword: string): Promise<boolean>;
}
