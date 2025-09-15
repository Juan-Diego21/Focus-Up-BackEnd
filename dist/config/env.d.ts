interface Env {
    PORT: number;
    NODE_ENV: string;
    API_PREFIX: string;
    PGHOST: string;
    PGPORT: number;
    PGDATABASE: string;
    PGUSER: string;
    PGPASSWORD: string;
    PGSSLMODE: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    BCRYPT_SALT_ROUNDS: number;
}
export declare const env: Env;
export {};
