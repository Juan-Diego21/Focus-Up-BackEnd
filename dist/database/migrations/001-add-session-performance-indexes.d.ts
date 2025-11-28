import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddSessionPerformanceIndexes001 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
