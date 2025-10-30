export declare class PasswordResetService {
    private passwordResetRepository;
    private userRepository;
    requestPasswordReset(emailOrUsername: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyResetCodeAndResetPassword(email: string, code: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export declare const passwordResetService: PasswordResetService;
