/**
 * Migración para crear la tabla codigos_verificacion
 *
 * Esta tabla almacena códigos de verificación de 6 dígitos para autenticación
 * de usuarios por email. Los códigos expiran en 10 minutos y tienen un contador
 * de intentos fallidos.
 *
 * Índices:
 * - idx_codigos_verificacion_email: Para búsquedas por email
 * - idx_codigos_verificacion_expira_en: Para limpieza de códigos expirados
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCodigosVerificacionTable002 implements MigrationInterface {
  name = 'CreateCodigosVerificacionTable002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear la tabla codigos_verificacion
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

    // Crear índice en email para búsquedas rápidas
    await queryRunner.query(`
      CREATE INDEX idx_codigos_verificacion_email
      ON codigos_verificacion (email);
    `);

    // Crear índice en expira_en para limpieza de códigos expirados
    await queryRunner.query(`
      CREATE INDEX idx_codigos_verificacion_expira_en
      ON codigos_verificacion (expira_en);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_codigos_verificacion_expira_en;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_codigos_verificacion_email;`);

    // Eliminar la tabla
    await queryRunner.query(`DROP TABLE IF EXISTS codigos_verificacion;`);
  }
}