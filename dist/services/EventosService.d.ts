import { IEventoCreate } from '../types/IEventoCreate';
export declare const EventoService: {
    listEvento(): Promise<{
        success: boolean;
        data: import("../models/Evento.entity").EventoEntity[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    crearEvento(data: IEventoCreate, idMetodo: any): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: import("../models/Evento.entity").EventoEntity;
        error?: undefined;
    }>;
    deleteEvento(id_evento: number): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    updateEvento(id: number, data: {
        nombreEvento?: string;
        fechaEvento?: Date;
        horaEvento?: string;
        descripcionEvento?: string;
    }): Promise<{
        success: boolean;
        error: string;
        timestamp: Date;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: import("../models/Evento.entity").EventoEntity | null;
        error?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp?: undefined;
        message?: undefined;
        data?: undefined;
    }>;
};
