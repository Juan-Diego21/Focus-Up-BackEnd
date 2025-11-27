export interface IPreferenciasUpdate {
    eventos?: boolean;
    metodosPendientes?: boolean;
    sesionesPendientes?: boolean;
    motivacion?: boolean;
}
export declare const NotificacionesPreferenciasService: {
    getPreferenciasByUsuario(userId: number): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            idUsuario: number;
            eventos: boolean;
            metodosPendientes: boolean;
            sesionesPendientes: boolean;
            motivacion: boolean;
            fechaActualizacion: Date;
        };
        error?: undefined;
    }>;
    updatePreferencias(userId: number, data: IPreferenciasUpdate): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            idUsuario: number;
            eventos: boolean;
            metodosPendientes: boolean;
            sesionesPendientes: boolean;
            motivacion: boolean;
            fechaActualizacion: Date;
        };
        error?: undefined;
    }>;
};
