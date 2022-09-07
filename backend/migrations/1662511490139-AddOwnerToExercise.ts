import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOwnerToExercise1662511490139 implements MigrationInterface {
    name = 'AddOwnerToExercise1662511490139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Exercise" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "Exercise" ADD CONSTRAINT "FK_faad9cb06cc306a1a37bfcca834" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Exercise" DROP CONSTRAINT "FK_faad9cb06cc306a1a37bfcca834"`);
        await queryRunner.query(`ALTER TABLE "Exercise" DROP COLUMN "ownerId"`);
    }

}
