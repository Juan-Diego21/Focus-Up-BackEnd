export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    token?: string;
    userId?: number;
    error?: string;
    timestamp: Date;
}
export interface PaginatedResponse<T> extends ApiResponse<T> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
