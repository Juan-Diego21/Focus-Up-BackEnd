"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = jwt_1.JwtUtils.extractTokenFromHeader(authHeader);
        if (!token) {
            const response = {
                success: false,
                message: "Token de acceso requerido",
                timestamp: new Date(),
            };
            return res.status(401).json(response);
        }
        const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Error en autenticación:", error);
        const response = {
            success: false,
            message: "Token inválido o expirado",
            timestamp: new Date(),
        };
        res.status(403).json(response);
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = jwt_1.JwtUtils.extractTokenFromHeader(authHeader);
    if (token) {
        try {
            const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
            req.user = decoded;
        }
        catch (error) {
            console.warn("Token opcional inválido:", error);
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
