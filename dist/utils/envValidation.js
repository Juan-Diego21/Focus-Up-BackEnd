"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
exports.getEnvVar = getEnvVar;
exports.getEnvNumber = getEnvNumber;
exports.getEnvBoolean = getEnvBoolean;
const envVars = [
    {
        name: "NODE_ENV",
        required: true,
        default: "development",
        validate: (value) => ["development", "production", "test"].includes(value),
    },
    {
        name: "PORT",
        required: true,
        default: "3000",
        validate: (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
    },
    {
        name: "API_PREFIX",
        required: true,
        default: "/api/v1",
    },
    {
        name: "PGHOST",
        required: true,
    },
    {
        name: "PGDATABASE",
        required: true,
    },
    {
        name: "PGUSER",
        required: true,
    },
    {
        name: "PGPASSWORD",
        required: true,
    },
    {
        name: "PGPORT",
        required: false,
        default: "5432",
        validate: (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
    },
    {
        name: "JWT_SECRET",
        required: true,
    },
    {
        name: "JWT_ACCESS_EXPIRES_IN",
        required: false,
        default: "24h",
    },
    {
        name: "BCRYPT_SALT_ROUNDS",
        required: false,
        default: "12",
        validate: (value) => !Number.isNaN(Number(value)) && Number(value) >= 8,
    },
    {
        name: "LOG_LEVEL",
        required: false,
        default: "info",
        validate: (value) => ["error", "warn", "info", "debug"].includes(value),
    },
];
function validateEnvironment() {
    const missingVars = [];
    const invalidVars = [];
    console.log("🔍 Validando variables de entorno...");
    for (const envVar of envVars) {
        const value = process.env[envVar.name];
        if (envVar.required && !value) {
            missingVars.push(envVar.name);
            continue;
        }
        if (!value && envVar.default) {
            process.env[envVar.name] = envVar.default;
            console.log(`⚠️  ${envVar.name} no definido, usando default: ${envVar.default}`);
            continue;
        }
        if (value && envVar.validate && !envVar.validate(value)) {
            invalidVars.push(`${envVar.name}="${value}"`);
        }
    }
    if (missingVars.length > 0) {
        throw new Error(`Variables de entorno requeridas faltantes: ${missingVars.join(", ")}`);
    }
    if (invalidVars.length > 0) {
        throw new Error(`Variables de entorno con valores inválidos: ${invalidVars.join(", ")}`);
    }
    console.log("✅ Todas las variables de entorno válidas");
}
function getEnvVar(name, defaultValue) {
    const value = process.env[name];
    if (!value) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Variable de entorno requerida faltante: ${name}`);
    }
    return value;
}
function getEnvNumber(name, defaultValue) {
    const value = getEnvVar(name, defaultValue?.toString());
    const num = Number(value);
    if (Number.isNaN(num)) {
        throw new TypeError(`Variable de entorno ${name} debe ser un número válido`);
    }
    return num;
}
function getEnvBoolean(name, defaultValue) {
    const value = getEnvVar(name, defaultValue?.toString());
    if (value === "true" || value === "1")
        return true;
    if (value === "false" || value === "0")
        return false;
    throw new Error(`Variable de entorno ${name} debe ser un valor booleano válido (true/false)`);
}
