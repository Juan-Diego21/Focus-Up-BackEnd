import { Request, Response, NextFunction } from "express";
export declare const validateUserCreate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateUserUpdate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validationEventCreate: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRequestVerificationCode: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateVerifyCode: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateRegister: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validatePasswordChange: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
