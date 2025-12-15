export interface IReportItem {
    id_reporte: number;
    id_usuario: number;
    nombre_metodo: string;
    progreso?: number;
    estado: string;
    fecha_creacion: Date;
}
