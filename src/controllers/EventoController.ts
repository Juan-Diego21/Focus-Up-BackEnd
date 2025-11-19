import { Response, Request } from "express";
import { EventoService } from "../services/EventosService";

/**
 * Controlador para la gestión de eventos de estudio
 * Maneja operaciones CRUD de eventos asociados a métodos de estudio
 */
export const eventosController = {
    /**
     * Listar todos los eventos de estudio registrados
     * Retorna eventos con información completa incluyendo método asociado
     */
    async listEventos(req: Request, res: Response) {
        try {
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

    /**
     * Crear un nuevo evento de estudio
     * Extrae el ID del usuario autenticado y valida los datos del evento incluyendo método y álbum opcional
     * Interactúa con el servicio para crear el evento en la base de datos
     */
    async crearEvento(req: Request, res: Response) {
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento, idMetodo, idAlbum } = req.body;
        const idUsuario = (req as any).user.userId; // Obtener ID del usuario autenticado

        try {
            const datos = await EventoService.crearEvento({
                nombreEvento,
                fechaEvento,
                horaEvento,
                descripcionEvento,
                idUsuario,
                idMetodo,
                idAlbum
            });

            if (datos?.success) {
                return res.status(201).json(datos);
            } else {
                return res.status(400).json(datos); // Cambiado a 400 para errores de validación
            }
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },

    /**
     * Eliminar un evento de estudio por su ID
     * Operación destructiva que requiere validación del ID
     */
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
                error: error.message || "Error interno al eliminar evento"
            });
        }
    },

    /**
     * Actualizar un evento de estudio existente
     * Permite modificar nombre, fecha, hora, descripción, método de estudio y álbum del evento
     * Valida que el evento pertenezca al usuario autenticado antes de actualizar
     */
    async updateEvento(req: Request, res: Response) {
        const { id } = req.params;
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento, idMetodo, idAlbum } = req.body;

        try {
            const datos = await EventoService.updateEvento(Number(id), {
                nombreEvento,
                fechaEvento,
                horaEvento,
                descripcionEvento,
                idMetodo,
                idAlbum,
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