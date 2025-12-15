import { Request, Response } from 'express';
export declare class NotificacionesPreferenciasController {
    private preferenciasService;
    getPreferencias(req: Request, res: Response): Promise<void>;
    updatePreferencias(req: Request, res: Response): Promise<void>;
}
