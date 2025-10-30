import { Request, Response } from "express";
export declare class UserController {
    createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    requestPasswordReset(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    resetPasswordWithCode(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const userController: UserController;
