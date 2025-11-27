"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSessionPerformanceIndexes001 = void 0;
class AddSessionPerformanceIndexes001 {
    constructor() {
        this.name = 'AddSessionPerformanceIndexes001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sesiones_concentracion_estado_ultima_interaccion
      ON sesiones_concentracion (estado, ultima_interaccion)
      WHERE estado = 'pendiente';
    `);
        await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sesiones_concentracion_fecha_actualizacion
      ON sesiones_concentracion (fecha_actualizacion)
      WHERE estado = 'pendiente';
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_sesiones_concentracion_fecha_actualizacion;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_sesiones_concentracion_estado_ultima_interaccion;`);
    }
}
exports.AddSessionPerformanceIndexes001 = AddSessionPerformanceIndexes001;
