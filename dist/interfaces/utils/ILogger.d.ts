export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export interface ILogger {
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    isLevelEnabled(level: LogLevel): boolean;
}
export interface ILoggerConfig {
    level: LogLevel;
    serviceName: string;
    logDirectory: string;
    errorLogFile: string;
    combinedLogFile: string;
    enableConsole: boolean;
}
