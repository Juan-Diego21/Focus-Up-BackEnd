import { IReportItem } from './IReportItem';

/**
 * Interfaz para los datos de reporte consolidados
 * Contiene métodos realizados, sesiones y vista combinada
 */
export interface IReportData {
  metodos: any[];
  sesiones: any[];
  combined: IReportItem[];
}