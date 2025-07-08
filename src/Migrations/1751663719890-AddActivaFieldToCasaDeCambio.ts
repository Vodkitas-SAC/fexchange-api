import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivaFieldToCasaDeCambio1751663719890 implements MigrationInterface {
    name = 'AddActivaFieldToCasaDeCambio1751663719890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "casas_de_cambio" ADD "activa" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "casas_de_cambio" DROP COLUMN "activa"`);
    }

}
