export interface CodigosVerificacion {
  id?: number;
  email: string;
  codigo: string;
  fechaCreacion: Date;
  expiraEn: Date;
  intentos: number;
  maxIntentos: number;
}

export interface CodigosVerificacionCreateInput {
  email: string;
  codigo: string;
  expiraEn: Date;
}

export interface ICodigosVerificacionRepository {
  createVerificationCode(data: CodigosVerificacionCreateInput): Promise<CodigosVerificacion>;
  findByEmailAndCode(email: string, codigo: string): Promise<CodigosVerificacion | null>;
  findActiveByEmail(email: string): Promise<CodigosVerificacion | null>;
  incrementAttempts(id: number): Promise<boolean>;
  deleteByEmail(email: string): Promise<boolean>;
  cleanupExpiredCodes(): Promise<number>;
  isCodeExpired(expiraEn: Date): boolean;
}