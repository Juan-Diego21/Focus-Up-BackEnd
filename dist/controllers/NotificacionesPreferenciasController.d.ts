import { Request, Response } from 'express';
type IdUsuarioParams = {
    idUsuario: string;
};
export declare class NotificacionesPreferenciasController {
    private preferenciasService;
    getPreferencias(req: Request<IdUsuarioParams>, res: Response): Promise<void>;
    updatePreferencias(req: Request<IdUsuarioParams>, res: Response): Promise<void>;
}
export {};
