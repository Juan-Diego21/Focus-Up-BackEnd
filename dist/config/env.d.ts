import { z } from "zod";
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    API_PREFIX: z.ZodDefault<z.ZodString>;
    FRONTEND_URL: z.ZodOptional<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        warn: "warn";
        info: "info";
        debug: "debug";
    }>>;
    PGHOST: z.ZodString;
    PGPORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    PGDATABASE: z.ZodString;
    PGUSER: z.ZodString;
    PGPASSWORD: z.ZodString;
    PGSSLMODE: z.ZodDefault<z.ZodEnum<{
        require: "require";
        disable: "disable";
    }>>;
    JWT_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    BCRYPT_SALT_ROUNDS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare const env: Env;
export {};
