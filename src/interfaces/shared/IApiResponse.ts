/**
 * Interfaz para respuestas de API estándar
 * Proporciona un contrato consistente para todas las respuestas HTTP
 */
export interface IApiResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;

  /** Mensaje descriptivo de la operación */
  message?: string;

  /** Datos de respuesta (opcional, solo presente si success = true) */
  data?: T;

  /** Timestamp de cuando se generó la respuesta */
  timestamp: Date;

  /** Detalles del error (opcional, solo presente si success = false) */
  error?: string;
}

/**
 * Tipo helper para respuestas exitosas
 */
export type ISuccessResponse<T = any> = IApiResponse<T> & {
  success: true;
  data: T;
};

/**
 * Tipo helper para respuestas de error
 */
export type IErrorResponse = IApiResponse<never> & {
  success: false;
  error: string;
};