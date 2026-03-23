import dotenv from "dotenv";
import { z } from "zod";

/**
 * Configuracion centralizada de variables de entorno.
 * Este archivo es la unica fuente de verdad para validar y tipar el entorno.
 */
dotenv.config();

const envSchema = z
  .object({
    // Server
    PORT: z.coerce.number().int().positive().default(3001),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    API_PREFIX: z.string().trim().min(1).default("/api/v1"),
    FRONTEND_URL: z.string().trim().optional(),

    // Logging
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),

    // Database
    PGHOST: z.string().trim().min(1, "PGHOST es requerido"),
    PGPORT: z.coerce.number().int().positive().default(5432),
    PGDATABASE: z.string().trim().min(1, "PGDATABASE es requerido"),
    PGUSER: z.string().trim().min(1, "PGUSER es requerido"),
    PGPASSWORD: z.string().trim().min(1, "PGPASSWORD es requerido"),
    PGSSLMODE: z.enum(["require", "disable"]).default("require"),

    // JWT
    JWT_SECRET: z.string().trim().min(1, "JWT_SECRET es requerido"),
    JWT_REFRESH_SECRET: z.string().trim().min(1, "JWT_REFRESH_SECRET es requerido"),
    JWT_ACCESS_EXPIRES_IN: z.string().trim().min(1).default("24h"),
    JWT_REFRESH_EXPIRES_IN: z.string().trim().min(1).default("7d"),

    // Security
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).default(12),
  })
  .superRefine((parsed, ctx) => {
    // En produccion exigimos URL de frontend para CORS estricto.
    if (parsed.NODE_ENV === "production" && !parsed.FRONTEND_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
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

export type Env = z.infer<typeof envSchema>;
export const env: Env = parsedEnv.data;
