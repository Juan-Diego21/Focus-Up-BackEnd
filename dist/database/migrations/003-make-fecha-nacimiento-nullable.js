"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeFechaNacimientoNullable003 = void 0;
class MakeFechaNacimientoNullable003 {
    constructor() {
        this.name = 'MakeFechaNacimientoNullable003';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      UPDATE usuario
      SET fecha_nacimiento = NULL
      WHERE fecha_nacimiento = '0002-02-02' OR fecha_nacimiento < '1900-01-01';
    `);
        await queryRunner.query(`
      ALTER TABLE usuario
      ALTER COLUMN fecha_nacimiento DROP NOT NULL;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE usuario
      ALTER COLUMN fecha_nacimiento SET NOT NULL;
    `);
    }
}
exports.MakeFechaNacimientoNullable003 = MakeFechaNacimientoNullable003;
