/**
 * Migración para hacer nullable la columna fecha_nacimiento en la tabla usuario
 *
 * Esta migración cambia la columna fecha_nacimiento de NOT NULL a NULL
 * para permitir registros de usuarios sin fecha de nacimiento.
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeFechaNacimientoNullable003 implements MigrationInterface {
  name = 'MakeFechaNacimientoNullable003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hacer nullable la columna fecha_nacimiento
    await queryRunner.query(`
      ALTER TABLE usuario
      ALTER COLUMN fecha_nacimiento DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: hacer NOT NULL la columna fecha_nacimiento
    // Nota: Esto puede fallar si hay registros con NULL
    await queryRunner.query(`
      ALTER TABLE usuario
      ALTER COLUMN fecha_nacimiento SET NOT NULL;
    `);
  }
}