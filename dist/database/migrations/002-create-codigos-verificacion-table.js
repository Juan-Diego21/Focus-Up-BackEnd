"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCodigosVerificacionTable002 = void 0;
class CreateCodigosVerificacionTable002 {
    constructor() {
        this.name = 'CreateCodigosVerificacionTable002';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE codigos_verificacion (
        id_codigo_verificacion SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        codigo VARCHAR(6) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_en TIMESTAMP NOT NULL,
        intentos INTEGER DEFAULT 0
      );
    `);
        await queryRunner.query(`
      CREATE INDEX idx_codigos_verificacion_email
      ON codigos_verificacion (email);
    `);
        await queryRunner.query(`
      CREATE INDEX idx_codigos_verificacion_expira_en
      ON codigos_verificacion (expira_en);
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_codigos_verificacion_expira_en;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_codigos_verificacion_email;`);
        await queryRunner.query(`DROP TABLE IF EXISTS codigos_verificacion;`);
    }
}
exports.CreateCodigosVerificacionTable002 = CreateCodigosVerificacionTable002;
