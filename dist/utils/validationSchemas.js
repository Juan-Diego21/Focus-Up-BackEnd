"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWithZod = exports.resetPasswordWithCodeSchema = exports.requestPasswordResetSchema = exports.registerSchema = exports.verifyCodeSchema = exports.requestVerificationCodeSchema = exports.changePasswordSchema = exports.userUpdateSchema = exports.loginSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
exports.userCreateSchema = zod_1.z.object({
    nombre_usuario: zod_1.z.string()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede exceder 50 caracteres")
        .regex(/^[a-zA-Z0-9_-]+$/, "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"),
    correo: zod_1.z.email("Formato de email inválido")
        .max(255, "El email no puede exceder 255 caracteres"),
    contrasena: zod_1.z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
    pais: zod_1.z.string().max(100, "El país no puede exceder 100 caracteres").optional(),
    genero: zod_1.z.enum(["Masculino", "Femenino", "Otro", "Prefiero no decir"]).optional(),
    fecha_nacimiento: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
        .refine((date) => {
        const d = new Date(date);
        return d instanceof Date && !Number.isNaN(d.getTime()) && date !== '0002-02-02';
    }, "Fecha de nacimiento inválida")
        .optional(),
    horario_fav: zod_1.z.string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)")
        .optional(),
    intereses: zod_1.z.array(zod_1.z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 intereses").optional(),
    distracciones: zod_1.z.array(zod_1.z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 distracciones").optional(),
});
exports.loginSchema = zod_1.z.object({
    correo: zod_1.z.email("Formato de email inválido").optional(),
    nombre_usuario: zod_1.z.string().min(1, "Nombre de usuario requerido").optional(),
    contrasena: zod_1.z.string().min(1, "Contraseña requerida"),
}).refine((data) => data.correo || data.nombre_usuario, {
    message: "Se requiere email o nombre de usuario",
    path: ["correo"],
});
exports.userUpdateSchema = zod_1.z.object({
    nombre_usuario: zod_1.z.string()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede exceder 50 caracteres")
        .regex(/^[a-zA-Z0-9_-]+$/, "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios")
        .optional(),
    correo: zod_1.z.email("Formato de email inválido")
        .max(255, "El email no puede exceder 255 caracteres")
        .optional(),
    contrasena: zod_1.z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número")
        .optional(),
    pais: zod_1.z.string().max(100, "El país no puede exceder 100 caracteres").optional(),
    genero: zod_1.z.enum(["Masculino", "Femenino", "Otro", "Prefiero no decir"]).optional(),
    fecha_nacimiento: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
        .refine((date) => {
        const d = new Date(date);
        return d instanceof Date && !Number.isNaN(d.getTime()) && date !== '0002-02-02';
    }, "Fecha de nacimiento inválida")
        .optional(),
    horario_fav: zod_1.z.string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)")
        .optional(),
    intereses: zod_1.z.array(zod_1.z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 intereses").optional(),
    distracciones: zod_1.z.array(zod_1.z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 distracciones").optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "Contraseña actual requerida"),
    newPassword: zod_1.z.string()
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número"),
});
exports.requestVerificationCodeSchema = zod_1.z.object({
    email: zod_1.z.email("Formato de email inválido"),
});
exports.verifyCodeSchema = zod_1.z.object({
    email: zod_1.z.email("Formato de email inválido"),
    codigo: zod_1.z.string().length(6, "El código debe tener 6 dígitos").regex(/^\d{6}$/, "El código debe contener solo números"),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.email("Formato de email inválido"),
    username: zod_1.z.string()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede exceder 50 caracteres")
        .regex(/^[a-zA-Z0-9_-]+$/, "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"),
    password: zod_1.z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
});
exports.requestPasswordResetSchema = zod_1.z.object({
    emailOrUsername: zod_1.z.string().min(1, "Email o nombre de usuario requerido"),
});
exports.resetPasswordWithCodeSchema = zod_1.z.object({
    email: zod_1.z.email("Formato de email inválido"),
    code: zod_1.z.string().length(6, "El código debe tener 6 dígitos").regex(/^\d{6}$/, "El código debe contener solo números"),
    newPassword: zod_1.z.string()
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número"),
});
const validateWithZod = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Datos de entrada inválidos",
                    errors: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                    timestamp: new Date(),
                });
            }
            next(error);
        }
    };
};
exports.validateWithZod = validateWithZod;
