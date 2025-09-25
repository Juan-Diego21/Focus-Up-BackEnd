import { Response, Request } from "express"
import {MetodoEstudioService} from "../services/MetodoEstudioService"


export const MetodoEstudioController ={
    async getMetodoList(req:Request, res:Response) {
        console.log('COntrolador funcionnado')
        try {
            const resul = await MetodoEstudioService.getMetodoList();
            if(resul.success){
                return res.status(200).json(resul); 
            }else{
                return res.status(404).json(resul);
            }
        }catch (error: any) {
            return res.status(500).json({ success: false, error: error.message || error });
        }

    },
    
    async getMetodoByname(req: Request, res: Response) {
        try {
            const nombreMetodo = req.params.nombre;
            const result = await MetodoEstudioService.getMetodoByname(nombreMetodo);
            if (result?.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },
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

export default MetodoEstudioController;