import { AppDataSource } from '../config/ormconfig';
import { NotificacionesUsuarioEntity } from '../models/NotificacionesUsuario.entity';

/**
 * Repositorio para la gestión de preferencias de notificaciones de usuarios
 * Proporciona acceso directo al repositorio de TypeORM para preferencias de notificaciones
 * Incluye consultas personalizadas para obtener y actualizar preferencias de un usuario específico
 */
export const NotificacionesPreferenciasRepository = AppDataSource.getRepository(NotificacionesUsuarioEntity);

/**
 * Método personalizado para obtener las preferencias de notificaciones de un usuario
 * Busca por id_usuario y retorna las configuraciones de notificaciones
 */
export const findPreferenciasByUsuario = async (userId: number) => {
  // Consulta para obtener las preferencias de notificaciones del usuario
  return await AppDataSource
    .getRepository(NotificacionesUsuarioEntity)
    .findOne({
      where: { idUsuario: userId },
      relations: ['usuario']
    });
};

/**
 * Método personalizado para crear o actualizar preferencias de notificaciones
 * Si no existen preferencias para el usuario, las crea con valores por defecto
 */
export const upsertPreferencias = async (userId: number, data: Partial<NotificacionesUsuarioEntity>) => {
  // Verificar si ya existen preferencias para el usuario
  const existing = await findPreferenciasByUsuario(userId);

  if (existing) {
    // Actualizar preferencias existentes
    await NotificacionesPreferenciasRepository.update(userId, data);
    // Retornar las preferencias actualizadas
    return await findPreferenciasByUsuario(userId);
  } else {
    // Crear nuevas preferencias con valores por defecto
    const newPreferencias = NotificacionesPreferenciasRepository.create({
      idUsuario: userId,
      eventos: data.eventos ?? true,
      metodosPendientes: data.metodosPendientes ?? true,
      sesionesPendientes: data.sesionesPendientes ?? true,
      motivacion: data.motivacion ?? true,
      ...data
    });
    const saved = await NotificacionesPreferenciasRepository.save(newPreferencias);
    // Retornar con relaciones
    return await findPreferenciasByUsuario(saved.idUsuario);
  }
};