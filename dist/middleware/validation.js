"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPasswordWithCode = exports.validateRequestPasswordReset = exports.validatePasswordChange = exports.validateLogin = exports.validateRegister = exports.validateVerifyCode = exports.validateRequestVerificationCode = exports.validationEventCreate = exports.validateUserUpdate = exports.validateUserCreate = void 0;
const validationSchemas_1 = require("../utils/validationSchemas");
exports.validateUserCreate = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.userCreateSchema);
exports.validateUserUpdate = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.userUpdateSchema);
const validationEventCreate = (req, res, next) => {
    next();
};
exports.validationEventCreate = validationEventCreate;
exports.validateRequestVerificationCode = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.requestVerificationCodeSchema);
exports.validateVerifyCode = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.verifyCodeSchema);
exports.validateRegister = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.registerSchema);
exports.validateLogin = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.loginSchema);
exports.validatePasswordChange = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.changePasswordSchema);
exports.validateRequestPasswordReset = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.requestPasswordResetSchema);
exports.validateResetPasswordWithCode = (0, validationSchemas_1.validateWithZod)(validationSchemas_1.resetPasswordWithCodeSchema);
