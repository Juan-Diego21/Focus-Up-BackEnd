import { Pool } from "pg";
declare const pool: Pool;
export declare const testConnection: () => Promise<boolean>;
export declare const executeQuery: (query: string, params?: any[]) => Promise<{
    success: boolean;
    data?: any[];
    error?: string;
    rowCount?: number;
}>;
export default pool;
