"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseBuilder = void 0;
class ResponseBuilder {
    static success(message, data, additionalFields) {
        return {
            success: true,
            message,
            data,
            timestamp: new Date(),
            ...additionalFields,
        };
    }
    static error(message, error, statusCode, additionalFields) {
        return {
            success: false,
            message,
            error,
            timestamp: new Date(),
            ...additionalFields,
        };
    }
    static validationError(message, error) {
        return this.error(message, error);
    }
    static serverError(error = "Ocurrió un error inesperado") {
        return this.error("Error interno del servidor", error);
    }
}
exports.ResponseBuilder = ResponseBuilder;
