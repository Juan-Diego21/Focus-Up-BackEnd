import { Request, Response } from "express";
export declare class UserController {
    createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    logout(req: Request, res: Response): Promise<void>;
    deleteMyAccount(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    requestPasswordReset(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    resetPasswordWithCode(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    changePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const userController: UserController;
