import { EventoEntity } from '../models/Evento.entity';
export declare const EventoRepository: import("typeorm").Repository<EventoEntity>;
export declare const findEventosByUsuario: (userId: number) => Promise<EventoEntity[]>;
