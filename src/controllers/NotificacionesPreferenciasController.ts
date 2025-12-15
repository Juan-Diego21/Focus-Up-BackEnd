import { Request, Response } from 'express';
import { NotificacionesPreferenciasService } from '../services/NotificacionesPreferenciasService';

/**
 * Controlador para la gestión de preferencias de notificaciones de usuarios
 * Maneja la lógica de negocio para obtener y actualizar las preferencias de notificación
 */
export class NotificacionesPreferenciasController {
  // Servicio inyectado para manejar la lógica de dominio de preferencias
  private preferenciasService = NotificacionesPreferenciasService;

  /**
   * Obtiene las preferencias de notificaciones de un usuario específico
   * Valida que el usuario autenticado pueda acceder a sus propias preferencias
   */
  async getPreferencias(req: Request, res: Response): Promise<void> {
    try {
      // Extraer el ID del usuario de los parámetros de ruta
      const { idUsuario } = req.params;
      const userId = parseInt(idUsuario, 10);

      // Validar que el usuario autenticado solo acceda a sus propias preferencias
      // Esto previene que usuarios vean las preferencias de otros
      if ((req as any).user.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a estas preferencias'
        });
        return;
      }

      // Llamar al servicio para obtener las preferencias del usuario
      const result = await this.preferenciasService.getPreferenciasByUsuario(userId);

      // Si el servicio retorna error, devolver respuesta de error
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Retornar las preferencias obtenidas exitosamente
      res.status(200).json(result);
    } catch (error) {
      // Loggear error interno para debugging
      console.error('Error en getPreferencias:', error);
      // Retornar error genérico del servidor
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza las preferencias de notificaciones de un usuario
   * Valida entrada, actualiza timestamps automáticamente y retorna el objeto actualizado
   */
  async updatePreferencias(req: Request, res: Response): Promise<void> {
    try {
      // Extraer el ID del usuario de los parámetros de ruta
      const { idUsuario } = req.params;
      const userId = parseInt(idUsuario, 10);
      // Extraer los datos de actualización del cuerpo de la petición
      const data = req.body;

      // Validar que el usuario autenticado solo modifique sus propias preferencias
      // Esto previene que usuarios modifiquen las preferencias de otros
      if ((req as any).user.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para modificar estas preferencias'
        });
        return;
      }

      // Llamar al servicio para actualizar las preferencias
      const result = await this.preferenciasService.updatePreferencias(userId, data);

      // Si el servicio retorna error, devolver respuesta de error
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Retornar las preferencias actualizadas exitosamente
      res.status(200).json(result);
    } catch (error) {
      // Loggear error interno para debugging
      console.error('Error en updatePreferencias:', error);
      // Retornar error genérico del servidor
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}