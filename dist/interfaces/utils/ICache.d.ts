export interface ICacheStats {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
}
export interface ICacheConfig {
    stdTTL: number;
    checkperiod: number;
    useClones: boolean;
}
export interface ICache {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttl?: number): boolean;
    del(key: string): number;
    has(key: string): boolean;
    mget<T>(keys: string[]): {
        [key: string]: T;
    };
    flushAll(): void;
    getStats(): ICacheStats;
}
export interface ICacheKeys {
    STUDY_METHODS: string;
    USER_ROLES: string;
    APP_CONFIG: string;
    METHOD_CONFIG: (methodId: number) => string;
    USER_PROFILE: (userId: number) => string;
}
