import { AppDataSource } from '../config/ormconfig';
import { EventoEntity } from '../models/Evento.entity';

/**
 * Repositorio para la gestión de eventos de estudio
 * Proporciona acceso directo al repositorio de TypeORM para eventos
 * Incluye consultas personalizadas para filtrado seguro por usuario
 */
export const EventoRepository = AppDataSource.getRepository(EventoEntity);

/**
 * Método personalizado para obtener eventos de un usuario específico
 * Filtra por id_usuario para asegurar que cada usuario solo vea sus propios eventos
 * Ordena por fecha y hora para presentación lógica
 */
export const findEventosByUsuario = async (userId: number) => {
  // Consulta SQL parametrizada para seguridad y rendimiento
  // SELECT * FROM eventos WHERE id_usuario = $1 ORDER BY fecha_evento ASC, hora_evento ASC;
  return await AppDataSource
    .getRepository(EventoEntity)
    .createQueryBuilder("evento")
    .leftJoinAndSelect("evento.metodoEstudio", "metodo")
    .leftJoinAndSelect("evento.album", "album")
    .leftJoinAndSelect("evento.usuario", "usuario")
    .where("evento.usuario = :userId", { userId })
    .orderBy("evento.fechaEvento", "ASC")
    .addOrderBy("evento.horaEvento", "ASC")
    .getMany();
};

