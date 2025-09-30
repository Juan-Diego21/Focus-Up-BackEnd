"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationEventCreate = exports.validateUserUpdate = exports.validateUserCreate = void 0;
const validation_1 = require("../utils/validation");
const validateUserCreate = (req, res, next) => {
    const { nombre_usuario, correo, contrasena, fecha_nacimiento } = req.body;
    const errors = [];
    if (!nombre_usuario || nombre_usuario.trim().length < 3) {
        errors.push("El nombre de usuario debe tener al menos 3 caracteres");
    }
    if (!correo || !validation_1.ValidationUtils.isValidEmail(correo)) {
        errors.push("Formato de email inválido");
    }
    if (!contrasena || !validation_1.ValidationUtils.isValidPassword(contrasena)) {
        errors.push("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número");
    }
    if (!fecha_nacimiento) {
        errors.push("La fecha de nacimiento es requerida");
    }
    else {
        try {
            const birthDate = new Date(fecha_nacimiento);
            if (isNaN(birthDate.getTime())) {
                errors.push("Fecha de nacimiento inválida");
            }
        }
        catch {
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
exports.validateUserCreate = validateUserCreate;
const validateUserUpdate = (req, res, next) => {
    const { correo, contrasena, horario_fav } = req.body;
    const errors = [];
    if (correo && !validation_1.ValidationUtils.isValidEmail(correo)) {
        errors.push("Formato de email inválido");
    }
    if (contrasena && !validation_1.ValidationUtils.isValidPassword(contrasena)) {
        errors.push("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número");
    }
    if (horario_fav && !validation_1.ValidationUtils.isValidTime(horario_fav)) {
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
exports.validateUserUpdate = validateUserUpdate;
const validationEventCreate = (req, res, next) => {
};
exports.validationEventCreate = validationEventCreate;
