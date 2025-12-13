import { z } from "zod";
export declare const userCreateSchema: z.ZodObject<{
    nombre_usuario: z.ZodString;
    correo: z.ZodString;
    contrasena: z.ZodString;
    pais: z.ZodOptional<z.ZodString>;
    genero: z.ZodOptional<z.ZodEnum<{
        Masculino: "Masculino";
        Femenino: "Femenino";
        Otro: "Otro";
        "Prefiero no decir": "Prefiero no decir";
    }>>;
    fecha_nacimiento: z.ZodOptional<z.ZodString>;
    horario_fav: z.ZodOptional<z.ZodString>;
    intereses: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    distracciones: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    correo: z.ZodOptional<z.ZodString>;
    nombre_usuario: z.ZodOptional<z.ZodString>;
    contrasena: z.ZodString;
}, z.core.$strip>;
export declare const userUpdateSchema: z.ZodObject<{
    nombre_usuario: z.ZodOptional<z.ZodString>;
    correo: z.ZodOptional<z.ZodString>;
    contrasena: z.ZodOptional<z.ZodString>;
    pais: z.ZodOptional<z.ZodString>;
    genero: z.ZodOptional<z.ZodEnum<{
        Masculino: "Masculino";
        Femenino: "Femenino";
        Otro: "Otro";
        "Prefiero no decir": "Prefiero no decir";
    }>>;
    fecha_nacimiento: z.ZodOptional<z.ZodString>;
    horario_fav: z.ZodOptional<z.ZodString>;
    intereses: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    distracciones: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const requestVerificationCodeSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const verifyCodeSchema: z.ZodObject<{
    email: z.ZodString;
    codigo: z.ZodString;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const requestPasswordResetSchema: z.ZodObject<{
    emailOrUsername: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordWithCodeSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const validateWithZod: (schema: z.ZodSchema) => (req: any, res: any, next: any) => any;
