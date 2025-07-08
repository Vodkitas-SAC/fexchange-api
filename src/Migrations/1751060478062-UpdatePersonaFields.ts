import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePersonaFields1751060478062 implements MigrationInterface {
    name = 'UpdatePersonaFields1751060478062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar las nuevas columnas primero
        await queryRunner.query(`ALTER TABLE "personas" ADD "apellido_paterno" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "apellido_materno" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "fecha_nacimiento" date`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "numero_telefono" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "tipo_documento" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "numero_documento" character varying(20)`);
        
        // Migrar los datos de las columnas antiguas a las nuevas
        await queryRunner.query(`UPDATE "personas" SET "apellido_paterno" = "apellidoPaterno" WHERE "apellidoPaterno" IS NOT NULL`);
        await queryRunner.query(`UPDATE "personas" SET "apellido_materno" = "apellidoMaterno" WHERE "apellidoMaterno" IS NOT NULL`);
        await queryRunner.query(`UPDATE "personas" SET "fecha_nacimiento" = "fechaNacimiento" WHERE "fechaNacimiento" IS NOT NULL`);
        await queryRunner.query(`UPDATE "personas" SET "numero_telefono" = "numeroTelefono" WHERE "numeroTelefono" IS NOT NULL`);
        await queryRunner.query(`UPDATE "personas" SET "tipo_documento" = "tipoDocumento" WHERE "tipoDocumento" IS NOT NULL`);
        await queryRunner.query(`UPDATE "personas" SET "numero_documento" = "numeroDocumento" WHERE "numeroDocumento" IS NOT NULL`);
        
        // Hacer las nuevas columnas NOT NULL
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "apellido_paterno" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "apellido_materno" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "fecha_nacimiento" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "numero_telefono" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "tipo_documento" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "numero_documento" SET NOT NULL`);
        
        // Eliminar las columnas antiguas
        await queryRunner.query(`ALTER TABLE "personas" DROP CONSTRAINT "UQ_22bb7195753df2b9f436e5b1460"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "apellidoPaterno"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "apellidoMaterno"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "fechaNacimiento"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "numeroTelefono"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "tipoDocumento"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "numeroDocumento"`);
        
        // Agregar la nueva constraint
        await queryRunner.query(`ALTER TABLE "personas" ADD CONSTRAINT "UQ_8636062e926a684e8e3a58d50af" UNIQUE ("numero_documento")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" DROP CONSTRAINT "UQ_8636062e926a684e8e3a58d50af"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "numero_documento"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "tipo_documento"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "numero_telefono"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "fecha_nacimiento"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "apellido_materno"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "apellido_paterno"`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "numeroDocumento" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ADD CONSTRAINT "UQ_22bb7195753df2b9f436e5b1460" UNIQUE ("numeroDocumento")`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "tipoDocumento" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "numeroTelefono" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "fechaNacimiento" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "apellidoMaterno" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "apellidoPaterno" character varying(100) NOT NULL`);
    }

}
