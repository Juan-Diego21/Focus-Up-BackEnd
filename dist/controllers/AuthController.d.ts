import { Request, Response } from "express";
export declare class AuthController {
    requestVerificationCode(req: Request, res: Response): Promise<void>;
    verifyCode(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
