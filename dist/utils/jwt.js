"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = exports.TokenBlacklistService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const JWT_SECRET = process.env.JWT_SECRET ||
    env_1.env.JWT_SECRET ||
    "fallback-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ||
    env_1.env.JWT_REFRESH_SECRET ||
    "fallback-refresh-secret-change-in-production";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || env_1.env.JWT_ACCESS_EXPIRES_IN || "24h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || env_1.env.JWT_REFRESH_EXPIRES_IN || "7d";
const tokenBlacklist = new Set();
class TokenBlacklistService {
    static addToBlacklist(token) {
        tokenBlacklist.add(token);
    }
    static isBlacklisted(token) {
        return tokenBlacklist.has(token);
    }
    static cleanupExpiredTokens() {
    }
}
exports.TokenBlacklistService = TokenBlacklistService;
class JwtUtils {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: JWT_ACCESS_EXPIRES_IN,
        });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        });
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new Error("Token de acceso inválido o expirado");
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw new Error("Token de refresco inválido o expirado");
        }
    }
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}
exports.JwtUtils = JwtUtils;
