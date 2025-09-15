import { Request, Response, NextFunction } from "express";
export declare const validateUserCreate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateUserUpdate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
