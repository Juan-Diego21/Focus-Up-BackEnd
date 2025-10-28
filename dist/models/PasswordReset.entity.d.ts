import { UserEntity } from "./User.entity";
export declare class PasswordResetEntity {
    id: number;
    userId: number;
    code: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
    user: UserEntity;
}
