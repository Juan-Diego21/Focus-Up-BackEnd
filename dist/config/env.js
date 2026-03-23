"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z
    .object({
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    API_PREFIX: zod_1.z.string().trim().min(1).default("/api/v1"),
    FRONTEND_URL: zod_1.z.string().trim().optional(),
    LOG_LEVEL: zod_1.z.enum(["error", "warn", "info", "debug"]).default("info"),
    PGHOST: zod_1.z.string().trim().min(1, "PGHOST es requerido"),
    PGPORT: zod_1.z.coerce.number().int().positive().default(5432),
    PGDATABASE: zod_1.z.string().trim().min(1, "PGDATABASE es requerido"),
    PGUSER: zod_1.z.string().trim().min(1, "PGUSER es requerido"),
    PGPASSWORD: zod_1.z.string().trim().min(1, "PGPASSWORD es requerido"),
    PGSSLMODE: zod_1.z.enum(["require", "disable"]).default("require"),
    JWT_SECRET: zod_1.z.string().trim().min(1, "JWT_SECRET es requerido"),
    JWT_REFRESH_SECRET: zod_1.z.string().trim().min(1, "JWT_REFRESH_SECRET es requerido"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().trim().min(1).default("24h"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().trim().min(1).default("7d"),
    BCRYPT_SALT_ROUNDS: zod_1.z.coerce.number().int().min(8).default(12),
})
    .superRefine((parsed, ctx) => {
    if (parsed.NODE_ENV === "production" && !parsed.FRONTEND_URL) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["FRONTEND_URL"],
            message: "FRONTEND_URL es requerido en produccion",
        });
    }
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    const details = parsedEnv.error.issues
        .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
        .join("; ");
    throw new Error(`Variables de entorno invalidas: ${details}`);
}
exports.env = parsedEnv.data;
