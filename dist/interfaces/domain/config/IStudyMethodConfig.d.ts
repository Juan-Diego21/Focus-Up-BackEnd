export interface IStudyMethodConfig {
    validCreationProgress: number[];
    validUpdateProgress: number[];
    validResumeProgress: number[];
    statusMap: {
        [progress: number]: string;
    };
    processes?: string[];
    states?: string[];
    totalSteps?: number;
    routePrefix?: string;
}
export interface IStudyMethodRegistry {
    [methodName: string]: IStudyMethodConfig;
}
export interface IMethodAliases {
    [alias: string]: string;
}
