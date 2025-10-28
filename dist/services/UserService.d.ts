import { UserCreateInput, UserUpdateInput, User } from "../types/User";
export declare class UserService {
    private static readonly SALT_ROUNDS;
    private static hashPassword;
    private static verifyPassword;
    createUser(userData: UserCreateInput): Promise<{
        success: boolean;
        user?: User;
        message?: string;
        error?: string;
    }>;
    getUserById(id: number): Promise<{
        success: boolean;
        user?: User;
        error?: string;
    }>;
    getUserByEmail(email: string): Promise<{
        success: boolean;
        user?: User;
        error?: string;
    }>;
    updateUser(id: number, updateData: UserUpdateInput): Promise<{
        success: boolean;
        user?: User;
        error?: string;
    }>;
    verifyCredentials(identifier: string, password: string): Promise<{
        success: boolean;
        user?: User;
        error?: string;
    }>;
    getAllUsers(): Promise<{
        success: boolean;
        users?: User[];
        error?: string;
    }>;
    private insertUserInterests;
    private insertUserDistractions;
    private insertUserInterestsInTransaction;
    private insertUserDistractionsInTransaction;
    deleteUser(id: number): Promise<{
        success: boolean;
        error?: string;
    }>;
    sendPasswordResetLink(emailOrUsername: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private sendResetEmail;
}
export declare const userService: UserService;
