import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { NotificacionesPreferenciasService } from '../services/NotificacionesPreferenciasService';

const router = Router();

// Controlador temporal para las rutas (se puede mover a un archivo separado si es necesario)
const notificacionesController = {
  /**
   * Obtiene las preferencias de notificaciones de un usuario
   * Valida que el usuario autenticado pueda acceder a sus propias preferencias
   */
  async getPreferencias(req: any, res: any) {
    try {
      const { idUsuario } = req.params;
      const userId = parseInt(idUsuario, 10);

      // Validar que el usuario autenticado solo acceda a sus propias preferencias
      if (req.user.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a estas preferencias'
        });
      }

      const result = await NotificacionesPreferenciasService.getPreferenciasByUsuario(userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error en getPreferencias:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * Actualiza las preferencias de notificaciones de un usuario
   * Valida entrada, actualiza timestamps automáticamente y retorna el objeto actualizado
   */
  async updatePreferencias(req: any, res: any) {
    try {
      const { idUsuario } = req.params;
      const userId = parseInt(idUsuario, 10);
      const data = req.body;

      // Validar que el usuario autenticado solo modifique sus propias preferencias
      if (req.user.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para modificar estas preferencias'
        });
      }

      const result = await NotificacionesPreferenciasService.updatePreferencias(userId, data);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error en updatePreferencias:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

// Obtener preferencias de notificaciones
router.get('/preferencias/:idUsuario', authenticateToken, notificacionesController.getPreferencias.bind(notificacionesController));
/**
 * @swagger
 * /notificaciones/preferencias/{idUsuario}:
 *   get:
 *     summary: Obtener preferencias de notificaciones de un usuario
 *     tags: [Notificaciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         description: ID del usuario cuyas preferencias se quieren obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Preferencias obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     idUsuario:
 *                       type: integer
 *                       description: ID del usuario
 *                     eventos:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de eventos
 *                     metodosPendientes:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de métodos pendientes
 *                     sesionesPendientes:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de sesiones pendientes
 *                     motivacion:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de motivación
 *                     fechaActualizacion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de última actualización
 *       403:
 *         description: No autorizado para acceder a estas preferencias
 *       404:
 *         description: Usuario no encontrado
 * */

// Actualizar preferencias de notificaciones
router.patch('/preferencias/:idUsuario', authenticateToken, notificacionesController.updatePreferencias.bind(notificacionesController));
/**
 * @swagger
 * /notificaciones/preferencias/{idUsuario}:
 *   patch:
 *     summary: Actualizar preferencias de notificaciones de un usuario
 *     tags: [Notificaciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         description: ID del usuario cuyas preferencias se quieren actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventos:
 *                 type: boolean
 *                 description: Habilitar/deshabilitar notificaciones de eventos
 *               metodosPendientes:
 *                 type: boolean
 *                 description: Habilitar/deshabilitar notificaciones de métodos pendientes
 *               sesionesPendientes:
 *                 type: boolean
 *                 description: Habilitar/deshabilitar notificaciones de sesiones pendientes
 *               motivacion:
 *                 type: boolean
 *                 description: Habilitar/deshabilitar notificaciones de motivación
 *     responses:
 *       200:
 *         description: Preferencias actualizadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Preferencias de notificaciones actualizadas correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idUsuario:
 *                       type: integer
 *                       description: ID del usuario
 *                     eventos:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de eventos
 *                     metodosPendientes:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de métodos pendientes
 *                     sesionesPendientes:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de sesiones pendientes
 *                     motivacion:
 *                       type: boolean
 *                       description: Preferencia para notificaciones de motivación
 *                     fechaActualizacion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de última actualización
 *       400:
 *         description: Datos inválidos o error en la actualización
 *       403:
 *         description: No autorizado para modificar estas preferencias
 * */

export default router;