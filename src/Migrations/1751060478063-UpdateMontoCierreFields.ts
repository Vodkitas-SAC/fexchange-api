import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMontoCierreFields1751060478063 implements MigrationInterface {
    name = 'UpdateMontoCierreFields1751060478063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar nuevos campos a la tabla montos_cierre
        await queryRunner.query(`
            ALTER TABLE "montos_cierre" 
            ADD COLUMN "monto_esperado" decimal(15,4) NOT NULL DEFAULT 0,
            ADD COLUMN "monto_fisico_real" decimal(15,4),
            ADD COLUMN "desfase_monto" decimal(15,4) DEFAULT 0,
            ADD COLUMN "desfase_porcentaje" decimal(5,2) DEFAULT 0,
            ADD COLUMN "confirmado_fisicamente" boolean DEFAULT false,
            ADD COLUMN "observaciones_desfase" text
        `);

        // Actualizar registros existentes con valores por defecto
        await queryRunner.query(`
            UPDATE "montos_cierre" 
            SET "monto_esperado" = "monto", 
                "monto_fisico_real" = "monto",
                "confirmado_fisicamente" = true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar las columnas agregadas
        await queryRunner.query(`
            ALTER TABLE "montos_cierre" 
            DROP COLUMN "observaciones_desfase",
            DROP COLUMN "confirmado_fisicamente",
            DROP COLUMN "desfase_porcentaje",
            DROP COLUMN "desfase_monto",
            DROP COLUMN "monto_fisico_real",
            DROP COLUMN "monto_esperado"
        `);
    }
}