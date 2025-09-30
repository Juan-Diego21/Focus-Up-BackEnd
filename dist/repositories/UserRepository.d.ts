import { User, UserCreateInput, UserUpdateInput, IUserRepository } from "../types/User";
export declare class UserRepository implements IUserRepository {
    private repository;
    constructor();
    create(userInput: UserCreateInput): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    update(id: number, updates: UserUpdateInput): Promise<User | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<User[]>;
    emailExists(email: string, excludeUserId?: number): Promise<boolean>;
    usernameExists(username: string, excludeUserId?: number): Promise<boolean>;
    private mapToUserDTO;
}
export declare const userRepository: IUserRepository;
