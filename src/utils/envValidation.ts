/**
 * Utilidad para validación de variables de entorno
 * Validación variables entorno - fallo temprano
 */

interface EnvVarConfig {
  name: string;
  required: boolean;
  default?: string;
  validate?: (value: string) => boolean;
}

/**
 * Configuración de variables de entorno requeridas
 */
const envVars: EnvVarConfig[] = [
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
    validate: (value) => !isNaN(Number(value)) && Number(value) > 0,
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
    validate: (value) => !isNaN(Number(value)) && Number(value) > 0,
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
    validate: (value) => !isNaN(Number(value)) && Number(value) >= 8,
  },
  {
    name: "LOG_LEVEL",
    required: false,
    default: "info",
    validate: (value) => ["error", "warn", "info", "debug"].includes(value),
  },
];

/**
 * Valida todas las variables de entorno al inicio de la aplicación
 * Lanza error si faltan variables requeridas o son inválidas
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  console.log("🔍 Validando variables de entorno...");

  for (const envVar of envVars) {
    const value = process.env[envVar.name];

    // Verificar si la variable requerida está presente
    if (envVar.required && !value) {
      missingVars.push(envVar.name);
      continue;
    }

    // Si no está presente pero tiene default, usar default
    if (!value && envVar.default) {
      process.env[envVar.name] = envVar.default;
      console.log(`⚠️  ${envVar.name} no definido, usando default: ${envVar.default}`);
      continue;
    }

    // Validar formato si hay validador
    if (value && envVar.validate && !envVar.validate(value)) {
      invalidVars.push(`${envVar.name}="${value}"`);
    }
  }

  // Reportar errores
  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno requeridas faltantes: ${missingVars.join(", ")}`
    );
  }

  if (invalidVars.length > 0) {
    throw new Error(
      `Variables de entorno con valores inválidos: ${invalidVars.join(", ")}`
    );
  }

  console.log("✅ Todas las variables de entorno válidas");
}

/**
 * Obtiene una variable de entorno con validación de tipo
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Variable de entorno requerida faltante: ${name}`);
  }

  return value;
}

/**
 * Obtiene una variable de entorno como número
 */
export function getEnvNumber(name: string, defaultValue?: number): number {
  const value = getEnvVar(name, defaultValue?.toString());
  const num = Number(value);

  if (isNaN(num)) {
    throw new Error(`Variable de entorno ${name} debe ser un número válido`);
  }

  return num;
}

/**
 * Obtiene una variable de entorno como booleano
 */
export function getEnvBoolean(name: string, defaultValue?: boolean): boolean {
  const value = getEnvVar(name, defaultValue?.toString());

  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;

  throw new Error(`Variable de entorno ${name} debe ser un valor booleano válido (true/false)`);
}