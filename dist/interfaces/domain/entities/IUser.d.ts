import { User, UserCreateInput, UserUpdateInput } from "../../../types/User";
export interface IUser extends User {
    idObjetivoEstudio?: number;
    tokenVersion?: number;
}
export type ICreateUser = UserCreateInput;
export type IUpdateUser = UserUpdateInput;
export type IUserResponse = Omit<User, 'contrasena'>;
