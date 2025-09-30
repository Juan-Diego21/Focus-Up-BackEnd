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
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    static isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        return usernameRegex.test(username) && !/\s/.test(username);
    }
    static sanitizeText(text) {
        return text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#x27;")
            .replace(/"/g, "&quot;");
    }
}
exports.ValidationUtils = ValidationUtils;
