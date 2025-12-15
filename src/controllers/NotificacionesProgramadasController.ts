import { Request, Response } from 'express';
import { NotificacionesProgramadasService } from '../services/NotificacionesProgramadasService';

/**
 * Controlador para la gestión de notificaciones programadas
 * Maneja la lógica de negocio para crear, obtener y marcar notificaciones como enviadas
 */
export class NotificacionesProgramadasController {
  // Servicio inyectado para manejar la lógica de dominio
  private notificacionesService = NotificacionesProgramadasService;

  /**
   * Crea una nueva notificación programada para un usuario
   * Valida permisos, datos de entrada y registra la notificación para envío futuro
   */
  async createScheduledNotification(req: Request, res: Response): Promise<void> {
    try {
      // Extraer datos del cuerpo de la petición
      const { idUsuario, tipo, titulo, mensaje, fechaProgramada } = req.body;

      // Verificar que el usuario autenticado solo pueda crear notificaciones para sí mismo
      // Esto previene que usuarios creen notificaciones para otros usuarios
      if ((req as any).user.userId !== idUsuario) {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para crear notificaciones para este usuario'
        });
        return;
      }

      // Validar que la fecha programada sea un formato de fecha válido
      const fechaProgramadaDate = new Date(fechaProgramada);
      if (isNaN(fechaProgramadaDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Fecha programada inválida'
        });
        return;
      }

      // Llamar al servicio para crear la notificación programada
      const result = await this.notificacionesService.createScheduledNotification({
        idUsuario,
        tipo,
        titulo,
        mensaje,
        fechaProgramada: fechaProgramadaDate
      });

      // Si el servicio retorna error, devolver respuesta de error
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Retornar respuesta exitosa con código 201 (creado)
      res.status(201).json(result);
    } catch (error) {
      // Loggear error interno para debugging
      console.error('Error en createScheduledNotification:', error);
      // Retornar error genérico del servidor
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene todas las notificaciones programadas pendientes para el usuario autenticado
   * Incluye información detallada de eventos y métodos de estudio asociados
   */
  async getScheduledNotifications(req: Request, res: Response): Promise<void> {
    try {
      // Obtener ID del usuario del token JWT
      const userId = (req as any).user.userId;

      // Llamar al servicio para obtener eventos próximos con notificaciones
      const result = await this.notificacionesService.getUpcomingEventsWithNotifications(userId);

      // Si ocurre error en el servicio, retornar error interno
      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      // Retornar lista de notificaciones programadas
      res.status(200).json(result);
    } catch (error) {
      // Loggear error para debugging
      console.error('Error en getScheduledNotifications:', error);
      // Retornar error genérico
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Marca una notificación específica como enviada después de un envío exitoso de email
   * Actualiza el estado de la notificación en la base de datos
   */
  async markAsSent(req: Request, res: Response): Promise<void> {
    try {
      // Extraer y validar el ID de la notificación de los parámetros de ruta
      const { id } = req.params;
      const idNotificacion = parseInt(id, 10);

      // Validar que el ID sea un número válido
      if (isNaN(idNotificacion)) {
        res.status(400).json({
          success: false,
          error: 'ID de notificación inválido'
        });
        return;
      }

      // Llamar al servicio para marcar como enviada
      const result = await this.notificacionesService.markAsSent(idNotificacion);

      // Si el servicio retorna error (ej: notificación no encontrada), devolver error
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Retornar confirmación de actualización exitosa
      res.status(200).json(result);
    } catch (error) {
      // Loggear error para debugging
      console.error('Error en markAsSent:', error);
      // Retornar error genérico
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}