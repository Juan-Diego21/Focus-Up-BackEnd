import { NotificacionesPreferenciasRepository, findPreferenciasByUsuario, upsertPreferencias } from '../repositories/NotificacionesPreferenciasRepository';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../models/User.entity';

// Repositorio de usuarios para validaciones
const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * Interfaz para actualizar preferencias de notificaciones
 * Define los campos opcionales para actualizar las configuraciones de notificaciones
 */
export interface IPreferenciasUpdate {
  eventos?: boolean;
  metodosPendientes?: boolean;
  sesionesPendientes?: boolean;
  motivacion?: boolean;
}

/**
 * Servicio para la gestión de preferencias de notificaciones de usuarios
 * Maneja operaciones de lectura y actualización de configuraciones de notificaciones
 * Incluye validación de usuarios y lógica de negocio para preferencias por defecto
 */
export const NotificacionesPreferenciasService = {
  /**
   * Obtiene las preferencias de notificaciones de un usuario específico
   * Si no existen preferencias, crea un registro con valores por defecto
   * Valida que el usuario exista antes de proceder
   */
  async getPreferenciasByUsuario(userId: number) {
    try {
      // Validar que el ID de usuario es válido
      if (!userId || userId <= 0) {
        return {
          success: false,
          error: 'ID de usuario inválido'
        };
      }

      // Verificar que el usuario existe
      const usuario = await userRepository.findOne({ where: { idUsuario: userId } });
      if (!usuario) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Obtener preferencias, creando si no existen
      let preferencias = await findPreferenciasByUsuario(userId);

      if (!preferencias) {
        // Crear preferencias por defecto si no existen
        preferencias = await upsertPreferencias(userId, {});
      }

      if (!preferencias) {
        throw new Error('Error al crear preferencias por defecto');
      }

      // Mapear respuesta para consistencia
      const preferenciasMapeadas = {
        idUsuario: preferencias.idUsuario,
        eventos: preferencias.eventos,
        metodosPendientes: preferencias.metodosPendientes,
        sesionesPendientes: preferencias.sesionesPendientes,
        motivacion: preferencias.motivacion,
        fechaActualizacion: preferencias.fechaActualizacion
      };

      return {
        success: true,
        data: preferenciasMapeadas
      };
    } catch (error) {
      console.error('Error al obtener preferencias de notificaciones:', error);
      return {
        success: false,
        error: 'Error interno al obtener preferencias'
      };
    }
  },

  /**
   * Actualiza las preferencias de notificaciones de un usuario
   * Valida que el usuario exista y que los valores booleanos sean válidos
   * Actualiza automáticamente el timestamp de fecha_actualizacion
   */
  async updatePreferencias(userId: number, data: IPreferenciasUpdate) {
    try {
      // Validar que el ID de usuario es válido
      if (!userId || userId <= 0) {
        return {
          success: false,
          error: 'ID de usuario inválido'
        };
      }

      // Verificar que el usuario existe
      const usuario = await userRepository.findOne({ where: { idUsuario: userId } });
      if (!usuario) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Validar que los valores proporcionados sean booleanos válidos
      const camposValidos = ['eventos', 'metodosPendientes', 'sesionesPendientes', 'motivacion'];
      for (const campo of camposValidos) {
        if (data[campo as keyof IPreferenciasUpdate] !== undefined) {
          const valor = data[campo as keyof IPreferenciasUpdate];
          if (typeof valor !== 'boolean') {
            return {
              success: false,
              error: `El campo ${campo} debe ser un valor booleano (true o false)`
            };
          }
        }
      }

      // Preparar datos de actualización
      const updateData: any = {};
      if (data.eventos !== undefined) updateData.eventos = data.eventos;
      if (data.metodosPendientes !== undefined) updateData.metodosPendientes = data.metodosPendientes;
      if (data.sesionesPendientes !== undefined) updateData.sesionesPendientes = data.sesionesPendientes;
      if (data.motivacion !== undefined) updateData.motivacion = data.motivacion;

      // Actualizar o crear preferencias
      const preferenciasActualizadas = await upsertPreferencias(userId, updateData);

      if (!preferenciasActualizadas) {
        return {
          success: false,
          error: 'Error al actualizar preferencias'
        };
      }

      // Mapear respuesta
      const preferenciasMapeadas = {
        idUsuario: preferenciasActualizadas.idUsuario,
        eventos: preferenciasActualizadas.eventos,
        metodosPendientes: preferenciasActualizadas.metodosPendientes,
        sesionesPendientes: preferenciasActualizadas.sesionesPendientes,
        motivacion: preferenciasActualizadas.motivacion,
        fechaActualizacion: preferenciasActualizadas.fechaActualizacion
      };

      return {
        success: true,
        message: 'Preferencias de notificaciones actualizadas correctamente',
        data: preferenciasMapeadas
      };
    } catch (error) {
      console.error('Error al actualizar preferencias de notificaciones:', error);
      return {
        success: false,
        error: 'Error interno al actualizar preferencias'
      };
    }
  }
};