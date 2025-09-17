import { User, UserCreateInput, UserUpdateInput } from '../types/User';
export declare class UserRepository {
    create(userInput: UserCreateInput): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    update(id: number, updates: UserUpdateInput): Promise<User | null>;
    findAll(): Promise<User[]>;
    emailExists(email: string, excludeUserId?: number): Promise<boolean>;
    usernameExists(username: string, excludeUserId?: number): Promise<boolean>;
}
export declare const userRepository: UserRepository;
