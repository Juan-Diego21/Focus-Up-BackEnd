export declare class TokenBlacklistService {
    static addToBlacklist(token: string): void;
    static isBlacklisted(token: string): boolean;
    static cleanupExpiredTokens(): void;
}
export interface JwtPayload {
    userId: number;
    email: string;
    tokenVersion: number;
}
export declare class JwtUtils {
    static generateAccessToken(payload: JwtPayload): string;
    static generateRefreshToken(payload: JwtPayload): string;
    static verifyAccessToken(token: string): JwtPayload;
    static verifyRefreshToken(token: string): JwtPayload;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
}
