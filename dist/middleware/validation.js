"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordChange = exports.validateRegister = exports.validateVerifyCode = exports.validateRequestVerificationCode = exports.validationEventCreate = exports.validateUserUpdate = exports.validateUserCreate = void 0;
const validation_1 = require("../utils/validation");
const validateUserCreate = (req, res, next) => {
    const { nombre_usuario, correo, contrasena, fecha_nacimiento } = req.body;
    const errors = [];
    if (!nombre_usuario || nombre_usuario.trim().length < 3) {
        errors.push("El nombre de usuario debe tener al menos 3 caracteres");
    }
    if (!validation_1.ValidationUtils.isValidUsername(nombre_usuario)) {
        errors.push("El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios");
    }
    if (!correo || !validation_1.ValidationUtils.isValidEmail(correo)) {
        errors.push("Formato de email inválido");
    }
    if (!contrasena || !validation_1.ValidationUtils.isValidPassword(contrasena)) {
        errors.push("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número");
    }
    if (fecha_nacimiento) {
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
    next();
};
exports.validationEventCreate = validationEventCreate;
const validateRequestVerificationCode = (req, res, next) => {
    const { email } = req.body;
    const errors = [];
    if (!email) {
        errors.push("El email es requerido");
    }
    else if (!validation_1.ValidationUtils.isValidEmail(email)) {
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
exports.validateRequestVerificationCode = validateRequestVerificationCode;
const validateVerifyCode = (req, res, next) => {
    const { email, codigo } = req.body;
    const errors = [];
    if (!email) {
        errors.push("El email es requerido");
    }
    else if (!validation_1.ValidationUtils.isValidEmail(email)) {
        errors.push("Formato de email inválido");
    }
    if (!codigo) {
        errors.push("El código de verificación es requerido");
    }
    else if (typeof codigo !== "string" || codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
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
exports.validateVerifyCode = validateVerifyCode;
const validateRegister = (req, res, next) => {
    const { email, username, password } = req.body;
    const errors = [];
    if (!email) {
        errors.push("El email es requerido");
    }
    else if (!validation_1.ValidationUtils.isValidEmail(email)) {
        errors.push("Formato de email inválido");
    }
    if (!username) {
        errors.push("El nombre de usuario es requerido");
    }
    else if (username.trim().length < 3) {
        errors.push("El nombre de usuario debe tener al menos 3 caracteres");
    }
    else if (!validation_1.ValidationUtils.isValidUsername(username)) {
        errors.push("El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios");
    }
    if (!password) {
        errors.push("La contraseña es requerida");
    }
    else if (!validation_1.ValidationUtils.isValidPassword(password)) {
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
exports.validateRegister = validateRegister;
const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const errors = [];
    if (!currentPassword) {
        errors.push("La contraseña actual es requerida");
    }
    if (!newPassword) {
        errors.push("La nueva contraseña es requerida");
    }
    else if (!validation_1.ValidationUtils.isValidPassword(newPassword)) {
        errors.push("La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número");
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
exports.validatePasswordChange = validatePasswordChange;
