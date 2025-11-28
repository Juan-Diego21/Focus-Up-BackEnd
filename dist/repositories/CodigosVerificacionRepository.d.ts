import { CodigosVerificacion, CodigosVerificacionCreateInput, ICodigosVerificacionRepository } from "../types/CodigosVerificacion";
export declare class CodigosVerificacionRepository implements ICodigosVerificacionRepository {
    private repository;
    constructor();
    createVerificationCode(data: CodigosVerificacionCreateInput): Promise<CodigosVerificacion>;
    findByEmailAndCode(email: string, codigo: string): Promise<CodigosVerificacion | null>;
    findActiveByEmail(email: string): Promise<CodigosVerificacion | null>;
    incrementAttempts(id: number): Promise<boolean>;
    deleteByEmail(email: string): Promise<boolean>;
    cleanupExpiredCodes(): Promise<number>;
    isCodeExpired(expiraEn: Date): boolean;
    private mapToDTO;
}
export declare const codigosVerificacionRepository: ICodigosVerificacionRepository;
