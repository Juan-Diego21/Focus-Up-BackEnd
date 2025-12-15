import { ICreateUser, IUpdateUser, IUser, IUserResponse } from "../entities/IUser";
export interface IUserService {
    createUser(userData: ICreateUser): Promise<{
        success: boolean;
        user?: IUser;
        message?: string;
        error?: string;
    }>;
    getUserById(id: number): Promise<{
        success: boolean;
        user?: IUser;
        error?: string;
    }>;
    getUserByEmail(email: string): Promise<{
        success: boolean;
        user?: IUser;
        error?: string;
    }>;
    updateUser(id: number, updateData: IUpdateUser): Promise<{
        success: boolean;
        user?: IUser;
        error?: string;
    }>;
    verifyCredentials(identifier: string, password: string): Promise<{
        success: boolean;
        user?: IUserResponse;
        error?: string;
    }>;
    getAllUsers(): Promise<{
        success: boolean;
        users?: IUser[];
        error?: string;
    }>;
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
