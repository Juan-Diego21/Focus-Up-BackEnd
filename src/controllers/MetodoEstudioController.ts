import { Response, Request } from "express"
import {MetodoEstudioService} from "../services/MetodoEstudioService"


export class MetodoEstudioController{
    async getMetodoList(req:Request, res:Response) {
        try {
            const resul = await MetodoEstudioService.getMetodoList();
            if(resul.success){
                return res.status(500).json(resul); 
            }else{
                return res.status(200).json(resul);
            }
        }catch(error) {
            return(error)
        }
    }
    async getMetodoByname(req: Request, res: Response) {
        try {
            const nombreMetodo = req.params.nombreMetodo; // O req.query / req.body según tu caso
            const result = await MetodoEstudioService.getMetodoByname(nombreMetodo);
            if (result?.success) {
                return res.status(404).json(result);
            } else {
                return res.status(200).json(result);
            }
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message || error });
        }
    }
    async getMetodoById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Id no valido' });
        }

        const result = await MetodoEstudioService.getMetodoById(id);
        if (result.success) {
            return res.status(200).json(result);
        }else{
        return res.status(404).json(result);
        }
    }

} 
 