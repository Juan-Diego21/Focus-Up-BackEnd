export interface IMailerConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    tls?: {
        rejectUnauthorized?: boolean;
    };
}
export interface IPasswordResetEmailData {
    to: string;
    name: string;
    code: string;
}
export interface IVerificationEmailData {
    to: string;
    code: string;
}
export interface IMailer {
    sendPasswordResetEmail(data: IPasswordResetEmailData): Promise<void>;
    sendVerificationEmail(data: IVerificationEmailData): Promise<void>;
    verifyConfiguration(): Promise<void>;
}
