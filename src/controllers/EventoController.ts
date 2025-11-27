import { Response, Request } from "express";
import { EventoService } from "../services/EventosService";

/**
 * Controlador para la gestión de eventos de estudio
 * Maneja operaciones CRUD de eventos asociados a métodos de estudio
 */
export const eventosController = {
    /**
     * Listar los eventos de estudio del usuario autenticado
     * Implementa filtrado por usuario para asegurar que cada usuario solo vea sus propios eventos
     * Extrae el ID del usuario del token JWT y lo pasa al servicio
     */
    async listEventos(req: Request, res: Response) {
        try {
            // Extraer ID del usuario autenticado desde el token JWT
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }

            const eventosUsuario = await EventoService.getEventosByUsuario(userId);

            if (eventosUsuario?.success) {
                return res.status(200).json(eventosUsuario);
            } else {
                return res.status(400).json(eventosUsuario);
            }
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message || 'Error interno del servidor'
            });
        }
    },

    /**
     * Crear un nuevo evento de estudio
     * Extrae el ID del usuario autenticado y valida los datos del evento incluyendo método y álbum opcional
     * Parsea las fechas correctamente antes de enviar al servicio
     */
    async crearEvento(req: Request, res: Response) {
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento, tipoEvento, idMetodo, idAlbum } = req.body;
        const idUsuario = (req as any).user.userId; // Obtener ID del usuario autenticado

        try {
            // Validar formato de fecha YYYY-MM-DD
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaEvento || !dateRegex.test(fechaEvento)) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                });
            }

            const datos = await EventoService.crearEvento({
                nombreEvento,
                fechaEvento, // Pasar como string
                horaEvento,
                descripcionEvento,
                tipoEvento,
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
            console.error('Error en crearEvento controller:', error);
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },

    /**
     * Eliminar un evento de estudio por su ID
     * Verifica que el evento pertenezca al usuario autenticado antes de eliminarlo
     * Operación destructiva que requiere validación de propiedad
     */
    async deleteEvento(req: Request, res: Response) {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        try {
            const resultado = await EventoService.deleteEvento(Number(id), userId);

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
        const { nombreEvento, fechaEvento, horaEvento, descripcionEvento, tipoEvento, idMetodo, idAlbum } = req.body;
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        try {
            // Validar fechaEvento si se proporciona
            if (fechaEvento) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(fechaEvento)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Formato de fecha inválido. Use YYYY-MM-DD'
                    });
                }
            }

            const datos = await EventoService.updateEvento(Number(id), userId, {
                nombreEvento,
                fechaEvento, // Pasar como string
                horaEvento,
                descripcionEvento,
                tipoEvento,
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