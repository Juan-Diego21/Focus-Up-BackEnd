"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codigosVerificacionRepository = exports.CodigosVerificacionRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const CodigosVerificacion_entity_1 = require("../models/CodigosVerificacion.entity");
const logger_1 = __importDefault(require("../utils/logger"));
class CodigosVerificacionRepository {
    constructor() {
        this.repository = ormconfig_1.AppDataSource.getRepository(CodigosVerificacion_entity_1.CodigosVerificacionEntity);
    }
    async createVerificationCode(data) {
        try {
            const code = this.repository.create({
                email: data.email.toLowerCase(),
                codigo: data.codigo,
                expiraEn: data.expiraEn,
                intentos: 0,
            });
            const savedCode = await this.repository.save(code);
            logger_1.default.info(`Código de verificación creado para email: ${data.email}`);
            return this.mapToDTO(savedCode);
        }
        catch (error) {
            logger_1.default.error("Error en CodigosVerificacionRepository.createVerificationCode:", error);
            throw error;
        }
    }
    async findByEmailAndCode(email, codigo) {
        try {
            const code = await this.repository.findOne({
                where: {
                    email: email.toLowerCase(),
                    codigo: codigo,
                },
            });
            return code ? this.mapToDTO(code) : null;
        }
        catch (error) {
            logger_1.default.error("Error en CodigosVerificacionRepository.findByEmailAndCode:", error);
            return null;
        }
    }
    async findActiveByEmail(email) {
        try {
            const code = await this.repository
                .createQueryBuilder("code")
                .where("code.email = :email", { email: email.toLowerCase() })
                .andWhere("code.expira_en > :now", { now: new Date() })
                .orderBy("code.fecha_creacion", "DESC")
                .getOne();
            return code ? this.mapToDTO(code) : null;
        }
        catch (error) {
            logger_1.default.error("Error en CodigosVerificacionRepository.findActiveByEmail:", error);
            return null;
        }
    }
    async incrementAttempts(id) {
        try {
            const result = await this.repository.increment({ idCodigoVerificacion: id }, "intentos", 1);
            logger_1.default.info(`Intentos incrementados para código ID: ${id}`);
            return true;
        }
        catch (error) {
            logger_1.default.error("Error en CodigosVerificacionRepository.incrementAttempts:", error);
            return false;
        }
    }
    async deleteByEmail(email) {
        try {
            const result = await this.repository.delete({ email: email.toLowerCase() });
            const deleted = !!(result.affected && result.affected > 0);
            if (deleted) {
                logger_1.default.info(`Códigos de verificación eliminados para email: ${email}`);
            }
            return deleted;
        }
        catch (error) {
            logger_1.default.error("Error en CodigosVerificacionRepository.deleteByEmail:", error);
            return false;
        }
    }
    async cleanupExpiredCodes() {
        try {
            const result = await this.repository
                .createQueryBuilder()
                .delete()
                .from(CodigosVerificacion_entity_1.CodigosVerificacionEntity)
                .where("expira_en < :now", { now: new Date() })
                .execute();
            const deletedCount = result.affected || 0;
            logger_1.default.info(`Códigos expirados eliminados: ${deletedCount}`);
            return deletedCount;
        }
        catch (error) {
            logger_1.default.error("Error en CodigosVerificacionRepository.cleanupExpiredCodes:", error);
            return 0;
        }
    }
    isCodeExpired(expiraEn) {
        return expiraEn < new Date();
    }
    mapToDTO(entity) {
        return {
            idCodigoVerificacion: entity.idCodigoVerificacion,
            email: entity.email,
            codigo: entity.codigo,
            fechaCreacion: entity.fechaCreacion,
            expiraEn: entity.expiraEn,
            intentos: entity.intentos,
        };
    }
}
exports.CodigosVerificacionRepository = CodigosVerificacionRepository;
exports.codigosVerificacionRepository = new CodigosVerificacionRepository();
