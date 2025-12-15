"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = void 0;
class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidPassword(password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }
    static isValidTime(time) {
        const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
        return timeRegex.test(time);
    }
    static isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        return usernameRegex.test(username) && !/\s/.test(username);
    }
    static sanitizeText(text) {
        return text
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("'", "&#x27;")
            .replace('"', "&quot;");
    }
}
exports.ValidationUtils = ValidationUtils;
