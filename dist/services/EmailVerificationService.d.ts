export declare class EmailVerificationService {
    private static readonly MAX_ATTEMPTS;
    private static readonly EXPIRATION_MINUTES;
    private static generateVerificationCode;
    private static getExpirationDate;
    requestVerificationCode(email: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
    verifyCode(email: string, codigo: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
    registerUser(email: string, username: string, password: string): Promise<{
        success: boolean;
        user?: any;
        message?: string;
        error?: string;
    }>;
    cleanupExpiredCodes(): Promise<{
        success: boolean;
        deletedCount?: number;
        message?: string;
        error?: string;
    }>;
}
export declare const emailVerificationService: EmailVerificationService;
