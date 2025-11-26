/**
 * Migración para agregar índices de rendimiento en la tabla sesiones_concentracion
 *
 * Se agrega índice compuesto en (estado, ultima_interaccion) para optimizar consultas
 * que buscan sesiones pendientes antiguas para recordatorios automáticos.
 *
 * Razón: El endpoint GET /sessions/pending/aged filtra por estado='pendiente'
 * y ultima_interaccion < fecha_corte, ordenando por fecha_creacion.
 * Este índice mejora significativamente el rendimiento de estas consultas.
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionPerformanceIndexes001 implements MigrationInterface {
  name = 'AddSessionPerformanceIndexes001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear índice compuesto para optimizar consultas de sesiones pendientes antiguas
    // Usado por el cron job que busca sesiones con estado='pendiente' y ultima_interaccion antigua
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sesiones_concentracion_estado_ultima_interaccion
      ON sesiones_concentracion (estado, ultima_interaccion)
      WHERE estado = 'pendiente';
    `);

    // Crear índice adicional en fecha_actualizacion como respaldo
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sesiones_concentracion_fecha_actualizacion
      ON sesiones_concentracion (fecha_actualizacion)
      WHERE estado = 'pendiente';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices en orden inverso
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sesiones_concentracion_fecha_actualizacion;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sesiones_concentracion_estado_ultima_interaccion;`);
  }
}