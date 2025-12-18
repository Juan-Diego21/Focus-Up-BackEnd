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
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: JWT_ACCESS_EXPIRES_IN,
        });
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            console.log('🔐 JWT Token generado:');
            console.log('  📅 Creación:', new Date(decoded.iat * 1000).toISOString());
            console.log('  ⏰ Expira a:', new Date(decoded.exp * 1000).toISOString());
            console.log('  ⏳ Expira en:', JWT_ACCESS_EXPIRES_IN);
            console.log('  👤 ID usuario:', payload.userId);
        }
        catch (error) {
            console.error('❌ Error decoding JWT token:', error);
        }
        return token;
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
            console.error("❌ Error verifying access token:", error);
            throw new Error("Token de acceso inválido o expirado");
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        }
        catch (error) {
            console.error("❌ Error verifying refresh token:", error);
            throw new Error("Token de refresco inválido o expirado");
        }
    }
    static extractTokenFromHeader(authHeader) {
        return authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    }
}
exports.JwtUtils = JwtUtils;
