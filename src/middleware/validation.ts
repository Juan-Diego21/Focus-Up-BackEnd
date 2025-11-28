import { Request, Response, NextFunction } from "express";
import { ValidationUtils } from "../utils/validation";

/**
 * Middleware de validación para la creación de usuarios
 * Valida nombre de usuario, email, contraseña y fecha de nacimiento
 */
export const validateUserCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nombre_usuario, correo, contrasena, fecha_nacimiento } = req.body;

  const errors: string[] = [];

  if (!nombre_usuario || nombre_usuario.trim().length < 3) {
    errors.push("El nombre de usuario debe tener al menos 3 caracteres");
  }

  if (!ValidationUtils.isValidUsername(nombre_usuario)) {
    errors.push("El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios");
  }

  if (!correo || !ValidationUtils.isValidEmail(correo)) {
    errors.push("Formato de email inválido");
  }

  if (!contrasena || !ValidationUtils.isValidPassword(contrasena)) {
    errors.push(
      "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número"
    );
  }

  if (fecha_nacimiento) {
    try {
      const birthDate = new Date(fecha_nacimiento);
      if (isNaN(birthDate.getTime())) {
        errors.push("Fecha de nacimiento inválida");
      }
    } catch {
      errors.push("Fecha de nacimiento inválida");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors,
      timestamp: new Date(),
    });
  }

  next();
};

/**
 * Middleware de validación para la actualización de usuarios
 * Valida email, contraseña y horario favorito si están presentes
 */
export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { correo, contrasena, horario_fav } = req.body;
  const errors: string[] = [];

  if (correo && !ValidationUtils.isValidEmail(correo)) {
    errors.push("Formato de email inválido");
  }

  if (contrasena && !ValidationUtils.isValidPassword(contrasena)) {
    errors.push(
      "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número"
    );
  }

  if (horario_fav && !ValidationUtils.isValidTime(horario_fav)) {
    errors.push("Formato de hora inválido (use HH:MM)");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors,
      timestamp: new Date(),
    });
  }

  next();
};
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
 * Valida que el email esté presente y tenga formato válido
 */
export const validateRequestVerificationCode = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  const errors: string[] = [];

  if (!email) {
    errors.push("El email es requerido");
  } else if (!ValidationUtils.isValidEmail(email)) {
    errors.push("Formato de email inválido");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors,
      timestamp: new Date(),
    });
  }

  next();
};

/**
 * Middleware de validación para verificar código
 * Valida que el email y código estén presentes
 */
export const validateVerifyCode = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, codigo } = req.body;

  const errors: string[] = [];

  if (!email) {
    errors.push("El email es requerido");
  } else if (!ValidationUtils.isValidEmail(email)) {
    errors.push("Formato de email inválido");
  }

  if (!codigo) {
    errors.push("El código de verificación es requerido");
  } else if (typeof codigo !== "string" || codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
    errors.push("El código debe ser un string de 6 dígitos");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors,
      timestamp: new Date(),
    });
  }

  next();
};

/**
 * Middleware de validación para registro de usuario
 * Valida email, nombre de usuario y contraseña
 */
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, username, password } = req.body;

  const errors: string[] = [];

  if (!email) {
    errors.push("El email es requerido");
  } else if (!ValidationUtils.isValidEmail(email)) {
    errors.push("Formato de email inválido");
  }

  if (!username) {
    errors.push("El nombre de usuario es requerido");
  } else if (username.trim().length < 3) {
    errors.push("El nombre de usuario debe tener al menos 3 caracteres");
  } else if (!ValidationUtils.isValidUsername(username)) {
    errors.push("El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios");
  }

  if (!password) {
    errors.push("La contraseña es requerida");
  } else if (!ValidationUtils.isValidPassword(password)) {
    errors.push("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors,
      timestamp: new Date(),
    });
  }

  next();
};
