import { MigrationInterface, QueryRunner } from "typeorm";
export declare class MakeFechaNacimientoNullable003 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
