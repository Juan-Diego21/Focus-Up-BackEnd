import { Request, Response, NextFunction } from "express";
import { ValidationUtils } from "../utils/validation";
import {
  validateWithZod,
  userCreateSchema,
  userUpdateSchema,
  loginSchema,
  changePasswordSchema,
  requestVerificationCodeSchema,
  verifyCodeSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordWithCodeSchema,
} from "../utils/validationSchemas";

/**
 * Middleware de validación para la creación de usuarios
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateUserCreate = validateWithZod(userCreateSchema);

/**
 * Middleware de validación para la actualización de usuarios
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateUserUpdate = validateWithZod(userUpdateSchema);
/**
 * Middleware de validación para la creación de eventos
 * TODO: Implementar validaciones específicas para eventos
 */
export const validationEventCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Implementar validaciones para eventos
  next();
};

/**
 * Middleware de validación para solicitar código de verificación
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateRequestVerificationCode = validateWithZod(requestVerificationCodeSchema);

/**
 * Middleware de validación para verificar código
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateVerifyCode = validateWithZod(verifyCodeSchema);

/**
 * Middleware de validación para registro de usuario
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateRegister = validateWithZod(registerSchema);

/**
 * Middleware de validación para login
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateLogin = validateWithZod(loginSchema);

/**
 * Middleware de validación para cambio de contraseña
 * Validación de entrada con Zod - previene datos malformados
 */
export const validatePasswordChange = validateWithZod(changePasswordSchema);

/**
 * Middleware de validación para solicitud de reset de contraseña
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateRequestPasswordReset = validateWithZod(requestPasswordResetSchema);

/**
 * Middleware de validación para reset de contraseña con código
 * Validación de entrada con Zod - previene datos malformados
 */
export const validateResetPasswordWithCode = validateWithZod(resetPasswordWithCodeSchema);
