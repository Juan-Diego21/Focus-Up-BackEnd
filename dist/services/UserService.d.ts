import { UserCreateInput, UserUpdateInput, User } from "../types/User";
import { IUserService } from "../interfaces/domain/services/IUserService";
export declare class UserService implements IUserService {
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
    private validateUpdateInput;
    private sanitizeUpdateInput;
    private checkUpdateUniqueness;
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
    private updateUserInterestsInTransaction;
    private updateUserDistractionsInTransaction;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
    deleteUser(id: number): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare const userService: UserService;
