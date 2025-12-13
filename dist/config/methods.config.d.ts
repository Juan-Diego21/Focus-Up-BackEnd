interface StudyMethodConfig {
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
interface StudyMethodRegistry {
    [methodName: string]: StudyMethodConfig;
}
interface MethodAliases {
    [alias: string]: string;
}
declare const studyMethodRegistry: StudyMethodRegistry;
declare const methodAliases: MethodAliases;
export { studyMethodRegistry, methodAliases, };
