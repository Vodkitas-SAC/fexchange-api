import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateClientesTipoEnum1751723200000 implements MigrationInterface {
    name = 'UpdateClientesTipoEnum1751723200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar nuevos campos a clientes
        await queryRunner.query(`ALTER TABLE "clientes" ADD "direccion_fiscal" text`);
        await queryRunner.query(`ALTER TABLE "clientes" ADD "profesion" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "clientes" ADD "es_activo" boolean NOT NULL DEFAULT true`);
        
        // Agregar campo cliente_temporal a transacciones
        await queryRunner.query(`ALTER TABLE "transacciones" ADD "cliente_temporal" jsonb`);
        
        // Convertir la columna tipo a texto temporalmente
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "tipo" TYPE text`);
        
        // Actualizar registros existentes con "OTRO" a "OCASIONAL"
        await queryRunner.query(`UPDATE "clientes" SET "tipo" = 'OCASIONAL' WHERE "tipo" = 'OTRO'`);
        
        // Actualizar descripción de clientes existentes
        await queryRunner.query(`UPDATE "clientes" SET "descripcion" = 'Cliente Ocasional' WHERE "descripcion" = 'Cliente No Registrado'`);
        
        // Recrear el enum con los nuevos valores (usar CASCADE)
        await queryRunner.query(`DROP TYPE "public"."clientes_tipo_enum" CASCADE`);
        await queryRunner.query(`CREATE TYPE "public"."clientes_tipo_enum" AS ENUM('REGISTRADO', 'EMPRESARIAL', 'OCASIONAL')`);
        
        // Convertir la columna de vuelta al enum
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "tipo" TYPE "public"."clientes_tipo_enum" USING "tipo"::"public"."clientes_tipo_enum"`);
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "tipo" SET DEFAULT 'OCASIONAL'`);
        
        // Actualizar la columna descripcion
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "descripcion" SET DEFAULT 'Cliente Ocasional'`);
        
        // Hacer cliente_id opcional en transacciones
        await queryRunner.query(`ALTER TABLE "transacciones" DROP CONSTRAINT "FK_528a79289138186857dc455c851"`);
        await queryRunner.query(`ALTER TABLE "transacciones" ALTER COLUMN "cliente_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transacciones" ADD CONSTRAINT "FK_528a79289138186857dc455c851" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios de transacciones
        await queryRunner.query(`ALTER TABLE "transacciones" DROP CONSTRAINT "FK_528a79289138186857dc455c851"`);
        await queryRunner.query(`ALTER TABLE "transacciones" ALTER COLUMN "cliente_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transacciones" ADD CONSTRAINT "FK_528a79289138186857dc455c851" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Revertir el enum
        await queryRunner.query(`CREATE TYPE "public"."clientes_tipo_enum_old" AS ENUM('REGISTRADO', 'OTRO')`);
        await queryRunner.query(`UPDATE "clientes" SET "tipo" = 'OTRO' WHERE "tipo" = 'OCASIONAL'`);
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "tipo" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "tipo" TYPE "public"."clientes_tipo_enum_old" USING "tipo"::"text"::"public"."clientes_tipo_enum_old"`);
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "tipo" SET DEFAULT 'OTRO'`);
        await queryRunner.query(`DROP TYPE "public"."clientes_tipo_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."clientes_tipo_enum_old" RENAME TO "clientes_tipo_enum"`);
        
        // Revertir descripción
        await queryRunner.query(`ALTER TABLE "clientes" ALTER COLUMN "descripcion" SET DEFAULT 'Cliente No Registrado'`);
        await queryRunner.query(`UPDATE "clientes" SET "descripcion" = 'Cliente No Registrado' WHERE "descripcion" = 'Cliente Ocasional'`);
        
        // Remover nuevos campos
        await queryRunner.query(`ALTER TABLE "transacciones" DROP COLUMN "cliente_temporal"`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "es_activo"`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "profesion"`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "direccion_fiscal"`);
    }
}