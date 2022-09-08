import {MigrationInterface, QueryRunner} from "typeorm";

export class AddExerciseOffering1662680465693 implements MigrationInterface {
    name = 'AddExerciseOffering1662680465693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exercise_offering" ("id" SERIAL NOT NULL, "inviteCode" text NOT NULL, "conditionCoverage" boolean NOT NULL DEFAULT true, "mutators" text array NOT NULL DEFAULT array[]::text[], "minTests" integer, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "exerciseId" integer, "ownerId" integer, CONSTRAINT "UQ_c3abed38ce3d8eb5c657835e44e" UNIQUE ("inviteCode"), CONSTRAINT "PK_e253755528993272183e9ecfc95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Attempt" ADD "exerciseOfferingId" integer`);
        await queryRunner.query(`ALTER TABLE "exercise_offering" ADD CONSTRAINT "FK_26bf18bff47c6556b9248e635b2" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exercise_offering" ADD CONSTRAINT "FK_05d1277facec11558fbb4ad63da" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Attempt" ADD CONSTRAINT "FK_0e0c7d230d28a5a9e03ecfc29e2" FOREIGN KEY ("exerciseOfferingId") REFERENCES "exercise_offering"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Attempt" DROP CONSTRAINT "FK_0e0c7d230d28a5a9e03ecfc29e2"`);
        await queryRunner.query(`ALTER TABLE "exercise_offering" DROP CONSTRAINT "FK_05d1277facec11558fbb4ad63da"`);
        await queryRunner.query(`ALTER TABLE "exercise_offering" DROP CONSTRAINT "FK_26bf18bff47c6556b9248e635b2"`);
        await queryRunner.query(`ALTER TABLE "Attempt" DROP COLUMN "exerciseOfferingId"`);
        await queryRunner.query(`DROP TABLE "exercise_offering"`);
    }

}
