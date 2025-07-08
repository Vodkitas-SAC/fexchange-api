import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMantenerCambioDiarioToTipoCambio1751672758483 implements MigrationInterface {
    name = 'AddMantenerCambioDiarioToTipoCambio1751672758483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tipos_cambio" ADD "mantener_cambio_diario" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" ALTER COLUMN "desfase_monto" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" ALTER COLUMN "desfase_porcentaje" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" ALTER COLUMN "confirmado_fisicamente" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "montos_cierre" ALTER COLUMN "confirmado_fisicamente" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" ALTER COLUMN "desfase_porcentaje" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" ALTER COLUMN "desfase_monto" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tipos_cambio" DROP COLUMN "mantener_cambio_diario"`);
    }

}
