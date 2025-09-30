import { Request, Response, NextFunction } from "express";
import { ValidationUtils } from "../utils/validation";

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
