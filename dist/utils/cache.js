"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.CacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    stdTTL: 3600,
    checkperiod: 600,
    useClones: false,
});
exports.cache = cache;
class CacheService {
    static get(key) {
        return cache.get(key);
    }
    static set(key, value, ttl) {
        return ttl !== undefined ? cache.set(key, value, ttl) : cache.set(key, value);
    }
    static del(key) {
        return cache.del(key);
    }
    static has(key) {
        return cache.has(key);
    }
    static mget(keys) {
        return cache.mget(keys);
    }
    static flushAll() {
        cache.flushAll();
    }
    static getStats() {
        return cache.getStats();
    }
}
exports.CacheService = CacheService;
CacheService.KEYS = {
    STUDY_METHODS: "study_methods",
    USER_ROLES: "user_roles",
    APP_CONFIG: "app_config",
    METHOD_CONFIG: (methodId) => `method_config_${methodId}`,
    USER_PROFILE: (userId) => `user_profile_${userId}`,
};
