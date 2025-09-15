export interface JwtPayload {
    userId: number;
    email: string;
}
export declare class JwtUtils {
    static generateAccessToken(payload: JwtPayload): string;
    static generateRefreshToken(payload: JwtPayload): string;
    static verifyAccessToken(token: string): JwtPayload;
    static verifyRefreshToken(token: string): JwtPayload;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
}
