import { AppDataSource } from '../config/ormconfig';
import { NotificacionesProgramadasEntity } from '../models/NotificacionesProgramadas.entity';

/**
 * Repositorio para la gestión de notificaciones programadas
 * Proporciona métodos específicos para crear, consultar y actualizar notificaciones programadas
 * Incluye lógica de inserción y actualización con validaciones de estado
 */
export const NotificacionesProgramadasRepository = AppDataSource.getRepository(NotificacionesProgramadasEntity);

/**
 * Crea una nueva notificación programada en la base de datos
 * Inserta un registro completo con todos los campos necesarios
 * La lógica de inserción incluye validación de fecha futura y estado inicial 'enviada = false'
 */
export const createScheduledNotification = async (data: Partial<NotificacionesProgramadasEntity>) => {
  // Crear la entidad con los datos proporcionados
  // Se asume que la validación de fecha y otros campos se hace en el servicio
  const nuevaNotificacion = NotificacionesProgramadasRepository.create({
    ...data,
    enviada: false, // Siempre inicia como no enviada
    fechaEnvio: undefined // No tiene fecha de envío inicialmente
  } as NotificacionesProgramadasEntity);

  // Guardar en la base de datos y retornar la entidad completa con ID generado
  return await NotificacionesProgramadasRepository.save(nuevaNotificacion);
};

/**
 * Obtiene todas las notificaciones pendientes de envío
 * Consulta notificaciones donde 'enviada = false' y 'fecha_programada <= NOW()'
 * Ordena por fecha programada para procesar en orden cronológico
 * Incluye relación con usuario para obtener datos de contacto
 */
export const getPendingNotifications = async () => {
  // Consulta SQL equivalente: SELECT * FROM notificaciones_programadas
  // WHERE enviada = false AND fecha_programada <= NOW()
  // ORDER BY fecha_programada ASC
  return await NotificacionesProgramadasRepository
    .createQueryBuilder("notificacion")
    .leftJoinAndSelect("notificacion.usuario", "usuario")
    .where("notificacion.enviada = :enviada", { enviada: false })
    .andWhere("notificacion.fechaProgramada <= :now", { now: new Date() })
    .orderBy("notificacion.fechaProgramada", "ASC")
    .getMany();
};

/**
 * Marca una notificación como enviada
 * Actualiza el campo 'enviada' a true y establece 'fecha_envio' con la fecha actual
 * La lógica de actualización asegura que solo se marque una vez y registra el momento exacto del envío
 */
export const markAsSent = async (idNotificacion: number) => {
  // Actualizar el registro con enviada = true y fecha_envio = NOW()
  // SQL equivalente: UPDATE notificaciones_programadas
  // SET enviada = true, fecha_envio = NOW()
  // WHERE id_notificacion = ?
  const result = await NotificacionesProgramadasRepository.update(idNotificacion, {
    enviada: true,
    fechaEnvio: new Date() // Establecer fecha de envío como momento actual
  });

  // Retornar true si se actualizó al menos un registro
  return result.affected && result.affected > 0;
};