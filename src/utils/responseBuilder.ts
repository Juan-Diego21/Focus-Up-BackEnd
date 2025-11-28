import { ApiResponse } from "../types/ApiResponse";

/**
 * Utilidad para construir respuestas API estandarizadas
 * Reduce duplicación de código en controladores
 */
export class ResponseBuilder {
  /**
   * Construye una respuesta de éxito
   */
  static success<T = any>(
    message: string,
    data?: T,
    additionalFields?: Partial<ApiResponse>
  ): ApiResponse {
    return {
      success: true,
      message,
      data,
      timestamp: new Date(),
      ...additionalFields,
    };
  }

  /**
   * Construye una respuesta de error
   */
  static error(
    message: string,
    error?: string,
    statusCode?: number,
    additionalFields?: Partial<ApiResponse>
  ): ApiResponse {
    return {
      success: false,
      message,
      error,
      timestamp: new Date(),
      ...additionalFields,
    };
  }

  /**
   * Construye una respuesta de validación fallida
   */
  static validationError(
    message: string,
    error?: string
  ): ApiResponse {
    return this.error(message, error);
  }

  /**
   * Construye una respuesta de error interno del servidor
   */
  static serverError(
    error: string = "Ocurrió un error inesperado"
  ): ApiResponse {
    return this.error("Error interno del servidor", error);
  }
}