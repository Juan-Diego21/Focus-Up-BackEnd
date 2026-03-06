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
 * Consulta notificaciones donde 'enviada = false' y 'fecha_programada <= NOW() + 10s' (buffer para mayor precisión)
 * Ordena por fecha programada para procesar en orden cronológico
 * Incluye relación con usuario para obtener datos de contacto
 */
export const getPendingNotifications = async () => {
  // Consulta SQL equivalente: SELECT * FROM notificaciones_programadas
  // WHERE enviada = false AND fecha_programada <= NOW() + 10 segundos (buffer para mayor precisión)
  // ORDER BY fecha_programada ASC
  const now = new Date();
  const bufferTime = new Date(now.getTime() + 10000); // Add 10 second buffer

  return await NotificacionesProgramadasRepository
    .createQueryBuilder("notificacion")
    .leftJoinAndSelect("notificacion.usuario", "usuario")
    .where("notificacion.enviada = :enviada", { enviada: false })
    .andWhere("notificacion.fechaProgramada <= :bufferTime", { bufferTime })
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
/**
 * Elimina notificaciones pendientes de tipo evento asociadas a un evento especifico.
 * Usa patron sobre el JSON serializado en mensaje para localizar idEvento.
 */
export const deletePendingEventNotificationsByEventId = async (
  idUsuario: number,
  idEvento: number
): Promise<number> => {
  if (!Number.isFinite(idEvento) || idEvento <= 0) return 0;

  const compactPattern = `%"idEvento":${idEvento}%`;
  const spacedPattern = `%"idEvento": ${idEvento}%`;
  const stringPattern = `%"idEvento":"${idEvento}"%`;

  const result = await NotificacionesProgramadasRepository
    .createQueryBuilder()
    .delete()
    .from(NotificacionesProgramadasEntity)
    .where("id_usuario = :idUsuario", { idUsuario })
    .andWhere("tipo = :tipo", { tipo: "evento" })
    .andWhere("enviada = false")
    .andWhere(
      "(mensaje LIKE :compactPattern OR mensaje LIKE :spacedPattern OR mensaje LIKE :stringPattern)",
      { compactPattern, spacedPattern, stringPattern }
    )
    .execute();

  return result.affected ?? 0;
};

/**
 * Elimina notificaciones pendientes de tipo evento usando firma legacy
 * (titulo + fecha aproximada) para compatibilidad con mensajes antiguos sin idEvento.
 */
export const deletePendingEventNotificationsByLegacySignature = async (
  idUsuario: number,
  titulo: string,
  fechaProgramada: Date
): Promise<number> => {
  if (!titulo || !fechaProgramada || Number.isNaN(fechaProgramada.getTime())) return 0;

  const windowStart = new Date(fechaProgramada.getTime() - 60_000);
  const windowEnd = new Date(fechaProgramada.getTime() + 60_000);

  const result = await NotificacionesProgramadasRepository
    .createQueryBuilder()
    .delete()
    .from(NotificacionesProgramadasEntity)
    .where("id_usuario = :idUsuario", { idUsuario })
    .andWhere("tipo = :tipo", { tipo: "evento" })
    .andWhere("enviada = false")
    .andWhere("titulo = :titulo", { titulo })
    .andWhere("fecha_programada BETWEEN :windowStart AND :windowEnd", {
      windowStart,
      windowEnd,
    })
    .execute();

  return result.affected ?? 0;
};
