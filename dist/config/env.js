"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: parseInt(process.env.PORT || "3001", 10),
    NODE_ENV: process.env.NODE_ENV || "development",
    API_PREFIX: process.env.API_PREFIX || "/api/v1",
    FRONTEND_URL: process.env.FRONTEND_URL || "",
    PGHOST: process.env.PGHOST || "",
    PGPORT: parseInt(process.env.PGPORT || "5432", 10),
    PGDATABASE: process.env.PGDATABASE || "",
    PGUSER: process.env.PGUSER || "",
    PGPASSWORD: process.env.PGPASSWORD || "",
    PGSSLMODE: process.env.PGSSLMODE || "require",
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"),
};
if (exports.env.NODE_ENV === "development") {
    console.log("🔍 Variables de entorno cargadas:");
    console.log("PORT:", exports.env.PORT);
    console.log("NODE_ENV:", exports.env.NODE_ENV);
    console.log("API_PREFIX:", exports.env.API_PREFIX);
    console.log("PGHOST:", exports.env.PGHOST ? "✅ Presente" : "❌ Faltante");
    console.log("PGDATABASE:", exports.env.PGDATABASE ? "✅ Presente" : "❌ Faltante");
    console.log("PGUSER:", exports.env.PGUSER ? "✅ Presente" : "❌ Faltante");
    console.log("PGPASSWORD:", exports.env.PGPASSWORD ? "✅ Presente" : "❌ Faltante");
}
if (!exports.env.PGHOST)
    throw new Error("❌ PGHOST no está configurada en .env");
if (!exports.env.PGDATABASE)
    throw new Error("❌ PGDATABASE no está configurada en .env");
if (!exports.env.PGUSER)
    throw new Error("❌ PGUSER no está configurada en .env");
if (!exports.env.PGPASSWORD)
    throw new Error("❌ PGPASSWORD no está configurada en .env");
if (!exports.env.JWT_SECRET)
    throw new Error("❌ JWT_SECRET no está configurada en .env");
if (!exports.env.JWT_REFRESH_SECRET)
    throw new Error("❌ JWT_REFRESH_SECRET no está configurada en .env");
if (exports.env.NODE_ENV === "production" && !exports.env.FRONTEND_URL)
    throw new Error("❌ FRONTEND_URL no está configurada en producción");
console.log("✅ Configuración de entorno cargada correctamente");
