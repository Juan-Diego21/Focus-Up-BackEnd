import { Request, Response, NextFunction } from "express";
export declare const checkSessionOwnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const snakeToCamelCase: (req: Request, res: Response, next: NextFunction) => void;
export declare const optimisticConcurrencyCheck: (req: Request, res: Response, next: NextFunction) => void;
