import { AppDataSource } from '../config/ormconfig';
import  {EventoEntity}  from '../models/Evento.entity';

export const EventoRepository = AppDataSource.getRepository(EventoEntity);

