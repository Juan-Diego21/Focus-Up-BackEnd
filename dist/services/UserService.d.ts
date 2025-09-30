import { UserCreateInput, UserUpdateInput, User } from '../types/User';
export declare class UserService {
    private static readonly SALT_ROUNDS;
    private static hashPassword;
    private static verifyPassword;
    createUser(userData: UserCreateInput): Promise<{
        success: boolean;
        user?: User;
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
    verifyCredentials(email: string, password: string): Promise<{
        success: boolean;
        user?: User;
        error?: string;
    }>;
    getAllUsers(): Promise<{
        success: boolean;
        users?: User[];
        error?: string;
    }>;
}
export declare const userService: UserService;
