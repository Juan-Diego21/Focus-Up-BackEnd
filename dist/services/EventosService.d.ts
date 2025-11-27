import { IEventoCreate, IEventoUpdate } from '../types/IEventoCreate';
export declare const EventoService: {
    getEventosByUsuario(userId: number): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: ({
            idEvento: number;
            nombreEvento: string;
            fechaEvento: string;
            horaEvento: string;
            descripcionEvento: string | undefined;
            tipoEvento: string | undefined;
            estado: "pendiente" | "completado" | null | undefined;
            idUsuario: number;
            idMetodo: number;
            idAlbum: number | undefined;
            fechaCreacion: Date;
            fechaActualizacion: Date;
        } | {
            metodo: {
                idMetodo: number;
                nombreMetodo: string;
                descripcion: string;
            } | null;
            album: {
                idAlbum: number;
                nombreAlbum: string;
                descripcion: string;
                genero: string;
            } | null;
            idEvento: number;
            nombreEvento: string;
            fechaEvento: string;
            horaEvento: string;
            descripcionEvento: string | undefined;
            tipoEvento: string | undefined;
            estado: "pendiente" | "completado" | null | undefined;
            idUsuario: number;
            idMetodo: number;
            idAlbum: number | undefined;
            fechaCreacion: Date;
            fechaActualizacion: Date;
        })[];
        error?: undefined;
    }>;
    crearEvento(data: IEventoCreate): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        metodo: {
            idMetodo: number;
            nombreMetodo: string;
            descripcion: string;
        } | null;
        album: {
            idAlbum: number;
            nombreAlbum: string;
            descripcion: string;
            genero: string;
        } | null;
        idEvento: number;
        nombreEvento: string;
        fechaEvento: string;
        horaEvento: string;
        descripcionEvento: string | undefined;
        tipoEvento: string | undefined;
        estado: "pendiente" | "completado" | null | undefined;
        idUsuario: number;
        idMetodo: number;
        idAlbum: number | undefined;
        fechaCreacion: Date;
        fechaActualizacion: Date;
        success?: undefined;
        error?: undefined;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            idEvento: number;
            nombreEvento: string;
            fechaEvento: string;
            horaEvento: string;
            descripcionEvento: string | undefined;
            tipoEvento: string | undefined;
            estado: "pendiente" | "completado" | null | undefined;
            idUsuario: number;
            idMetodo: number;
            idAlbum: number | undefined;
            fechaCreacion: Date;
            fechaActualizacion: Date;
        };
        error?: undefined;
    }>;
    deleteEvento(id_evento: number, userId: number): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    updateEvento(id: number, userId: number, data: IEventoUpdate): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        metodo: {
            idMetodo: number;
            nombreMetodo: string;
            descripcion: string;
        } | null;
        album: {
            idAlbum: number;
            nombreAlbum: string;
            descripcion: string;
            genero: string;
        } | null;
        idEvento: number;
        nombreEvento: string;
        fechaEvento: string;
        horaEvento: string;
        descripcionEvento: string | undefined;
        tipoEvento: string | undefined;
        estado: "pendiente" | "completado" | null | undefined;
        idUsuario: number;
        idMetodo: number;
        idAlbum: number | undefined;
        fechaCreacion: Date;
        fechaActualizacion: Date;
        success?: undefined;
        error?: undefined;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            idEvento: number;
            nombreEvento: string;
            fechaEvento: string;
            horaEvento: string;
            descripcionEvento: string | undefined;
            tipoEvento: string | undefined;
            estado: "pendiente" | "completado" | null | undefined;
            idUsuario: number;
            idMetodo: number;
            idAlbum: number | undefined;
            fechaCreacion: Date;
            fechaActualizacion: Date;
        };
        error?: undefined;
    }>;
    marcarComoCompletado(id: number, userId: number): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    marcarComoPendiente(id: number, userId: number): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    actualizarEstado(id: number, userId: number, estado: "pendiente" | "completado" | null): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
};
