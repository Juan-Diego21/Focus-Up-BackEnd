import { ApiResponse } from "../types/ApiResponse";
export declare class ResponseBuilder {
    static success<T = any>(message: string, data?: T, additionalFields?: Partial<ApiResponse>): ApiResponse;
    static error(message: string, error?: string, statusCode?: number, additionalFields?: Partial<ApiResponse>): ApiResponse;
    static validationError(message: string, error?: string): ApiResponse;
    static serverError(error?: string): ApiResponse;
}
