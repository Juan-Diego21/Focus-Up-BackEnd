import NodeCache from "node-cache";
declare const cache: NodeCache;
export declare class CacheService {
    static get<T>(key: string): T | undefined;
    static set<T>(key: string, value: T, ttl?: number): boolean;
    static del(key: string): number;
    static has(key: string): boolean;
    static mget<T>(keys: string[]): {
        [key: string]: T;
    };
    static flushAll(): void;
    static getStats(): NodeCache.Stats;
    static readonly KEYS: {
        readonly STUDY_METHODS: "study_methods";
        readonly USER_ROLES: "user_roles";
        readonly APP_CONFIG: "app_config";
        readonly METHOD_CONFIG: (methodId: number) => string;
        readonly USER_PROFILE: (userId: number) => string;
    };
}
export { cache };
