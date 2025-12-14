import { z } from "zod";

/**
 * Esquemas de validación Zod para la aplicación
 * Validación de entrada con Zod - previene datos malformados
 * Proporciona validación robusta y mensajes de error detallados
 */

// Esquema para creación de usuario
export const userCreateSchema = z.object({
  nombre_usuario: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"),

  correo: z.email("Formato de email inválido")
    .max(255, "El email no puede exceder 255 caracteres"),

  contrasena: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),

  pais: z.string().max(100, "El país no puede exceder 100 caracteres").optional(),

  genero: z.enum(["Masculino", "Femenino", "Otro", "Prefiero no decir"]).optional(),

  fecha_nacimiento: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .refine((date) => {
      const d = new Date(date);
      return d instanceof Date && !Number.isNaN(d.getTime()) && date !== '0002-02-02';
    }, "Fecha de nacimiento inválida")
    .optional(),

  horario_fav: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)")
    .optional(),

  intereses: z.array(z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 intereses").optional(),

  distracciones: z.array(z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 distracciones").optional(),
});

// Esquema para login
export const loginSchema = z.object({
  correo: z.email("Formato de email inválido").optional(),
  nombre_usuario: z.string().min(1, "Nombre de usuario requerido").optional(),
  contrasena: z.string().min(1, "Contraseña requerida"),
}).refine((data) => data.correo || data.nombre_usuario, {
  message: "Se requiere email o nombre de usuario",
  path: ["correo"],
});

// Esquema para actualización de usuario
export const userUpdateSchema = z.object({
  nombre_usuario: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios")
    .optional(),

  correo: z.email("Formato de email inválido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional(),

  contrasena: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número")
    .optional(),

  pais: z.string().max(100, "El país no puede exceder 100 caracteres").optional(),

  genero: z.enum(["Masculino", "Femenino", "Otro", "Prefiero no decir"]).optional(),

  fecha_nacimiento: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .refine((date) => {
      const d = new Date(date);
      return d instanceof Date && !Number.isNaN(d.getTime()) && date !== '0002-02-02';
    }, "Fecha de nacimiento inválida")
    .optional(),

  horario_fav: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)")
    .optional(),

  intereses: z.array(z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 intereses").optional(),

  distracciones: z.array(z.number().int().positive()).max(10, "No se pueden seleccionar más de 10 distracciones").optional(),
});

// Esquema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Contraseña actual requerida"),
  newPassword: z.string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número"),
});

// Esquema para solicitud de verificación de código
export const requestVerificationCodeSchema = z.object({
  email: z.email("Formato de email inválido"),
});

// Esquema para verificación de código
export const verifyCodeSchema = z.object({
  email: z.email("Formato de email inválido"),
  codigo: z.string().length(6, "El código debe tener 6 dígitos").regex(/^\d{6}$/, "El código debe contener solo números"),
});

// Esquema para registro de usuario
export const registerSchema = z.object({
  email: z.email("Formato de email inválido"),
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
});

// Esquema para solicitud de reset de contraseña
export const requestPasswordResetSchema = z.object({
  emailOrUsername: z.string().min(1, "Email o nombre de usuario requerido"),
});

// Esquema para reset de contraseña con código
export const resetPasswordWithCodeSchema = z.object({
  email: z.email("Formato de email inválido"),
  code: z.string().length(6, "El código debe tener 6 dígitos").regex(/^\d{6}$/, "El código debe contener solo números"),
  newPassword: z.string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número"),
});

/**
 * Middleware genérico para validación con Zod
 * Procesa errores de validación y retorna respuestas estandarizadas
 * @param schema - Esquema Zod a utilizar para validación
 * @returns Middleware de Express que valida y maneja errores
 */
export const validateWithZod = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
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