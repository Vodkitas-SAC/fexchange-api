import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1750526190987 implements MigrationInterface {
    name = 'InitialSchema1750526190987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "personas" ("id" SERIAL NOT NULL, "nombres" character varying(100) NOT NULL, "apellidoPaterno" character varying(100) NOT NULL, "apellidoMaterno" character varying(100) NOT NULL, "fechaNacimiento" date NOT NULL, "numeroTelefono" character varying(20) NOT NULL, "direccion" text NOT NULL, "tipoDocumento" character varying(50) NOT NULL, "numeroDocumento" character varying(20) NOT NULL, "nacionalidad" character varying(100) NOT NULL, "ocupacion" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_22bb7195753df2b9f436e5b1460" UNIQUE ("numeroDocumento"), CONSTRAINT "PK_714aa5d028f8f3e6645e971cecd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tipos_cambio" ("id" SERIAL NOT NULL, "tipo_compra" numeric(10,4) NOT NULL, "tipo_venta" numeric(10,4) NOT NULL, "activo" boolean NOT NULL DEFAULT true, "fecha_vigencia" TIMESTAMP NOT NULL DEFAULT now(), "casa_de_cambio_id" integer NOT NULL, "moneda_origen_id" integer NOT NULL, "moneda_destino_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dcd5231eb34f8987ac9185fa868" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "montos_apertura" ("id" SERIAL NOT NULL, "monto" numeric(15,4) NOT NULL, "apertura_ventanilla_id" integer NOT NULL, "moneda_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9a6cbb07c565148befb67246215" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "monedas" ("id" SERIAL NOT NULL, "codigo" character varying(10) NOT NULL, "nombre" character varying(100) NOT NULL, "simbolo" character varying(10) NOT NULL, "decimales" integer NOT NULL DEFAULT '2', "activa" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_04f0a98e94920e229df2a53c528" UNIQUE ("codigo"), CONSTRAINT "PK_0c476b164bd9107174753e20d4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "montos_cierre" ("id" SERIAL NOT NULL, "monto" numeric(15,4) NOT NULL, "cierre_ventanilla_id" integer NOT NULL, "moneda_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fe8a664bd16805b562846eec546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cierres_ventanilla" ("id" SERIAL NOT NULL, "fecha_cierre" date NOT NULL, "hora_cierre" TIME NOT NULL, "ganancia_total" numeric(15,4) NOT NULL, "observaciones_cierre" text, "ventanilla_id" integer NOT NULL, "usuario_id" integer NOT NULL, "apertura_ventanilla_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e7538c6674675eaedb560bee30b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('ADMINISTRADOR_MAESTRO', 'ADMINISTRADOR', 'ENCARGADO_VENTANILLA')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "password" character varying(255) NOT NULL, "email" character varying(100) NOT NULL, "rol" "public"."usuarios_rol_enum" NOT NULL DEFAULT 'ENCARGADO_VENTANILLA', "activo" boolean NOT NULL DEFAULT true, "persona_id" integer NOT NULL, "casa_de_cambio_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE ("username"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "aperturas_ventanilla" ("id" SERIAL NOT NULL, "fecha_apertura" date NOT NULL, "hora_apertura" TIME NOT NULL, "observaciones_apertura" text, "activa" boolean NOT NULL DEFAULT true, "ventanilla_id" integer NOT NULL, "usuario_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c38e3d5b81185f3c254df3b434f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."clientes_tipo_enum" AS ENUM('REGISTRADO', 'OTRO')`);
        await queryRunner.query(`CREATE TABLE "clientes" ("id" SERIAL NOT NULL, "tipo" "public"."clientes_tipo_enum" NOT NULL DEFAULT 'OTRO', "descripcion" character varying(100) NOT NULL DEFAULT 'Cliente No Registrado', "ruc" character varying(20), "razon_social" character varying(200), "estado_civil" character varying(50), "persona_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d76bf3571d906e4e86470482c08" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transacciones_estado_enum" AS ENUM('COMPLETADA', 'CANCELADA', 'PENDIENTE')`);
        await queryRunner.query(`CREATE TABLE "transacciones" ("id" SERIAL NOT NULL, "numero_transaccion" character varying(50) NOT NULL, "monto_origen" numeric(15,4) NOT NULL, "monto_destino" numeric(15,4) NOT NULL, "tipo_cambio_aplicado" numeric(10,4) NOT NULL, "ganancia" numeric(15,4) NOT NULL, "estado" "public"."transacciones_estado_enum" NOT NULL DEFAULT 'COMPLETADA', "observaciones" text, "cliente_id" integer NOT NULL, "ventanilla_id" integer NOT NULL, "moneda_origen_id" integer NOT NULL, "moneda_destino_id" integer NOT NULL, "tipo_cambio_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_86bebbcbda2687151098d78701d" UNIQUE ("numero_transaccion"), CONSTRAINT "PK_0a2c5d8bfe49d3bbccff3f17e8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ventanillas_estado_enum" AS ENUM('CERRADA', 'ABIERTA', 'PAUSA')`);
        await queryRunner.query(`CREATE TABLE "ventanillas" ("id" SERIAL NOT NULL, "identificador" character varying(50) NOT NULL, "nombre" character varying(100) NOT NULL, "estado" "public"."ventanillas_estado_enum" NOT NULL DEFAULT 'CERRADA', "activa" boolean NOT NULL DEFAULT true, "casa_de_cambio_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e514d3e0d5c1e84bed600a39250" UNIQUE ("identificador"), CONSTRAINT "PK_2ed21ea39cfa322ef08105b88ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "casas_de_cambio" ("id" SERIAL NOT NULL, "identificador" character varying(100) NOT NULL, "nombre" character varying(200) NOT NULL, "direccion" text NOT NULL, "telefono" character varying(20) NOT NULL, "email" character varying(100) NOT NULL, "ruc" character varying(20) NOT NULL, "razon_social" character varying(200) NOT NULL, "moneda_maestra_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cf42ea32c9329da8cb3f174608c" UNIQUE ("identificador"), CONSTRAINT "PK_b27e5d5eef79394239044d55a67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tipos_cambio" ADD CONSTRAINT "FK_07baab9713ecbd28a6f6c5f83f2" FOREIGN KEY ("casa_de_cambio_id") REFERENCES "casas_de_cambio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tipos_cambio" ADD CONSTRAINT "FK_826c05df3108d709afdc5556e1f" FOREIGN KEY ("moneda_origen_id") REFERENCES "monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tipos_cambio" ADD CONSTRAINT "FK_53d30f80c46f75e621c93156bd1" FOREIGN KEY ("moneda_destino_id") REFERENCES "monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "montos_apertura" ADD CONSTRAINT "FK_86813ce0bb881ae97150ddb59f1" FOREIGN KEY ("apertura_ventanilla_id") REFERENCES "aperturas_ventanilla"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "montos_apertura" ADD CONSTRAINT "FK_20660d6a5b514c7df2800fac06a" FOREIGN KEY ("moneda_id") REFERENCES "monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" ADD CONSTRAINT "FK_18735a50a6d58902d10e9c9afc8" FOREIGN KEY ("cierre_ventanilla_id") REFERENCES "cierres_ventanilla"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" ADD CONSTRAINT "FK_f2080e50c269136c0a6eeec1447" FOREIGN KEY ("moneda_id") REFERENCES "monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cierres_ventanilla" ADD CONSTRAINT "FK_0fe50efff22eefee264f17d7c72" FOREIGN KEY ("ventanilla_id") REFERENCES "ventanillas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cierres_ventanilla" ADD CONSTRAINT "FK_9714e2d16b7082e98eef4385871" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cierres_ventanilla" ADD CONSTRAINT "FK_f63a0aad8030d9ccd2fae015a70" FOREIGN KEY ("apertura_ventanilla_id") REFERENCES "aperturas_ventanilla"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_899199fd151861c079720cc508f" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_42a999ba7dfd414727183eb29c5" FOREIGN KEY ("casa_de_cambio_id") REFERENCES "casas_de_cambio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "aperturas_ventanilla" ADD CONSTRAINT "FK_19c802c1f9bcd0304266712f3d5" FOREIGN KEY ("ventanilla_id") REFERENCES "ventanillas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "aperturas_ventanilla" ADD CONSTRAINT "FK_ceb955aed7d322424336a0ef813" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clientes" ADD CONSTRAINT "FK_718a0540a10d174c78f5202d175" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transacciones" ADD CONSTRAINT "FK_528a79289138186857dc455c851" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transacciones" ADD CONSTRAINT "FK_d2f6f52a7d3a915a92f6d1e3fcf" FOREIGN KEY ("ventanilla_id") REFERENCES "ventanillas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transacciones" ADD CONSTRAINT "FK_0f6839a950442506364adec5575" FOREIGN KEY ("moneda_origen_id") REFERENCES "monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transacciones" ADD CONSTRAINT "FK_239e54934e166436a35c57555ef" FOREIGN KEY ("moneda_destino_id") REFERENCES "monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transacciones" ADD CONSTRAINT "FK_f4acc3327d53cc5266a4d0a28a3" FOREIGN KEY ("tipo_cambio_id") REFERENCES "tipos_cambio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ventanillas" ADD CONSTRAINT "FK_b9f2b4b69d866a13e2af2140b08" FOREIGN KEY ("casa_de_cambio_id") REFERENCES "casas_de_cambio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "casas_de_cambio" ADD CONSTRAINT "FK_37bb7a20035d8675fa8a1b871ff" FOREIGN KEY ("moneda_maestra_id") REFERENCES "monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "casas_de_cambio" DROP CONSTRAINT "FK_37bb7a20035d8675fa8a1b871ff"`);
        await queryRunner.query(`ALTER TABLE "ventanillas" DROP CONSTRAINT "FK_b9f2b4b69d866a13e2af2140b08"`);
        await queryRunner.query(`ALTER TABLE "transacciones" DROP CONSTRAINT "FK_f4acc3327d53cc5266a4d0a28a3"`);
        await queryRunner.query(`ALTER TABLE "transacciones" DROP CONSTRAINT "FK_239e54934e166436a35c57555ef"`);
        await queryRunner.query(`ALTER TABLE "transacciones" DROP CONSTRAINT "FK_0f6839a950442506364adec5575"`);
        await queryRunner.query(`ALTER TABLE "transacciones" DROP CONSTRAINT "FK_d2f6f52a7d3a915a92f6d1e3fcf"`);
        await queryRunner.query(`ALTER TABLE "transacciones" DROP CONSTRAINT "FK_528a79289138186857dc455c851"`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP CONSTRAINT "FK_718a0540a10d174c78f5202d175"`);
        await queryRunner.query(`ALTER TABLE "aperturas_ventanilla" DROP CONSTRAINT "FK_ceb955aed7d322424336a0ef813"`);
        await queryRunner.query(`ALTER TABLE "aperturas_ventanilla" DROP CONSTRAINT "FK_19c802c1f9bcd0304266712f3d5"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_42a999ba7dfd414727183eb29c5"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_899199fd151861c079720cc508f"`);
        await queryRunner.query(`ALTER TABLE "cierres_ventanilla" DROP CONSTRAINT "FK_f63a0aad8030d9ccd2fae015a70"`);
        await queryRunner.query(`ALTER TABLE "cierres_ventanilla" DROP CONSTRAINT "FK_9714e2d16b7082e98eef4385871"`);
        await queryRunner.query(`ALTER TABLE "cierres_ventanilla" DROP CONSTRAINT "FK_0fe50efff22eefee264f17d7c72"`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" DROP CONSTRAINT "FK_f2080e50c269136c0a6eeec1447"`);
        await queryRunner.query(`ALTER TABLE "montos_cierre" DROP CONSTRAINT "FK_18735a50a6d58902d10e9c9afc8"`);
        await queryRunner.query(`ALTER TABLE "montos_apertura" DROP CONSTRAINT "FK_20660d6a5b514c7df2800fac06a"`);
        await queryRunner.query(`ALTER TABLE "montos_apertura" DROP CONSTRAINT "FK_86813ce0bb881ae97150ddb59f1"`);
        await queryRunner.query(`ALTER TABLE "tipos_cambio" DROP CONSTRAINT "FK_53d30f80c46f75e621c93156bd1"`);
        await queryRunner.query(`ALTER TABLE "tipos_cambio" DROP CONSTRAINT "FK_826c05df3108d709afdc5556e1f"`);
        await queryRunner.query(`ALTER TABLE "tipos_cambio" DROP CONSTRAINT "FK_07baab9713ecbd28a6f6c5f83f2"`);
        await queryRunner.query(`DROP TABLE "casas_de_cambio"`);
        await queryRunner.query(`DROP TABLE "ventanillas"`);
        await queryRunner.query(`DROP TYPE "public"."ventanillas_estado_enum"`);
        await queryRunner.query(`DROP TABLE "transacciones"`);
        await queryRunner.query(`DROP TYPE "public"."transacciones_estado_enum"`);
        await queryRunner.query(`DROP TABLE "clientes"`);
        await queryRunner.query(`DROP TYPE "public"."clientes_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "aperturas_ventanilla"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum"`);
        await queryRunner.query(`DROP TABLE "cierres_ventanilla"`);
        await queryRunner.query(`DROP TABLE "montos_cierre"`);
        await queryRunner.query(`DROP TABLE "monedas"`);
        await queryRunner.query(`DROP TABLE "montos_apertura"`);
        await queryRunner.query(`DROP TABLE "tipos_cambio"`);
        await queryRunner.query(`DROP TABLE "personas"`);
    }

}
