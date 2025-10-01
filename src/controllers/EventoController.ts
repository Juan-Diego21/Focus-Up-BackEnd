import { Response, Request } from "express"
import {EventoService} from "../services/EventosService"
import { error } from "console";


export const eventosController ={
    async listEventos(req:Request,res:Response){
            console.log("Entrando a listEventos"); // <-- Agrega esto

        try{
            const listarEventos = await EventoService.listEvento();
            if(listarEventos?.success){
                return res.status(200).json(listarEventos); 
            }else{
                return res.status(404).json(listarEventos);
            }
        }catch (error:any){
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },
    async crearEvento (req:Request,res:Response){
        const  {nombreEvento,fechaEvento,horaEvento,descripcionEvento,idMetodo } = req.body
        try{
            const datos = await EventoService.crearEvento({nombreEvento,fechaEvento,horaEvento,descripcionEvento},idMetodo );
            if(datos?.success){
                return res.status(201).json(datos); 
            }else{
                return res.status(404).json(datos);
            }
        }catch (error:any){
         return res.status(500).json({ success: false, error: error.message || error });
        }
    },
    
    async deleteEvento(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const resultado = await EventoService.deleteEvento(Number(id));

            if (resultado.success) {
            return res.status(200).json(resultado);
            } else {
            return res.status(404).json(resultado);
            }
        } catch (error: any) {
            return res.status(500).json({
            success: false,
            
            });
        }
    }, 
    async updateEvento(req: Request, res: Response) {
        const { id } = req.params;
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento } = req.body;

        try {
            const datos = await EventoService.updateEvento(Number(id), {
            nombreEvento,
            fechaEvento,
            horaEvento,
            descripcionEvento,
            });

            if (datos.success) {
            return res.status(200).json(datos);
            } else {
            return res.status(404).json(datos);
            }
        } catch (error: any) {
            return res.status(500).json({
            success: false,
            error: error.message || "Error interno al actualizar evento"
            });
        }
    }
}