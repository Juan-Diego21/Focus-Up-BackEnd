/**
 * Error de dominio HTTP para transportar codigo de estado y mensaje
 * desde capas internas hasta el middleware global.
 */
export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}
