export interface IApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    timestamp: Date;
    error?: string;
}
export type ISuccessResponse<T = any> = IApiResponse<T> & {
    success: true;
    data: T;
};
export type IErrorResponse = IApiResponse<never> & {
    success: false;
    error: string;
};
