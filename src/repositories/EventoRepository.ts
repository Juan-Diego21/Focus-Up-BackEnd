import { AppDataSource } from '../config/ormconfig';
import { EventoEntity } from '../models/Evento.entity';

/**
 * Repositorio para la gestión de eventos de estudio
 * Proporciona acceso directo al repositorio de TypeORM para eventos
 */
export const EventoRepository = AppDataSource.getRepository(EventoEntity);

