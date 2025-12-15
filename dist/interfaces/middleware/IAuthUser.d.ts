import { JwtPayload } from "../../utils/jwt";
export interface IAuthUser extends JwtPayload {
    username?: string;
    role?: string;
    iat?: number;
    exp?: number;
}
