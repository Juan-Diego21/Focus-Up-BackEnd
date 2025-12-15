import { IBaseRepository } from "./IBaseRepository";
import { IUser, ICreateUser, IUpdateUser } from "../entities/IUser";
export interface IUserRepository extends IBaseRepository<IUser, ICreateUser, IUpdateUser> {
    findByEmail(email: string): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    emailExists(email: string, excludeUserId?: number): Promise<boolean>;
    usernameExists(username: string, excludeUserId?: number): Promise<boolean>;
    updatePassword(userId: number, hashedPassword: string): Promise<boolean>;
}
