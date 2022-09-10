import {MigrationInterface, QueryRunner} from "typeorm";

export class AddExerciseOffering1662849502849 implements MigrationInterface {
    name = 'AddExerciseOffering1662849502849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ExerciseOffering" ("id" SERIAL NOT NULL, "inviteCode" text NOT NULL, "conditionCoverage" boolean NOT NULL DEFAULT true, "mutators" text array NOT NULL DEFAULT array[]::text[], "minTests" integer, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "exerciseId" integer, "ownerId" integer, CONSTRAINT "UQ_d173e2acfcf148db1a2810f7d1e" UNIQUE ("inviteCode"), CONSTRAINT "PK_1e9ba3d99ab443be1b36a034a62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Attempt" ADD "exerciseOfferingId" integer`);
        await queryRunner.query(`ALTER TABLE "ExerciseOffering" ADD CONSTRAINT "FK_e9f2fb00bf2bb45db97b9c4ad6c" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ExerciseOffering" ADD CONSTRAINT "FK_973007516ea36e0784b0dbcfe1d" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Attempt" ADD CONSTRAINT "FK_0e0c7d230d28a5a9e03ecfc29e2" FOREIGN KEY ("exerciseOfferingId") REFERENCES "ExerciseOffering"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Attempt" DROP CONSTRAINT "FK_0e0c7d230d28a5a9e03ecfc29e2"`);
        await queryRunner.query(`ALTER TABLE "ExerciseOffering" DROP CONSTRAINT "FK_973007516ea36e0784b0dbcfe1d"`);
        await queryRunner.query(`ALTER TABLE "ExerciseOffering" DROP CONSTRAINT "FK_e9f2fb00bf2bb45db97b9c4ad6c"`);
        await queryRunner.query(`ALTER TABLE "Attempt" DROP COLUMN "exerciseOfferingId"`);
        await queryRunner.query(`DROP TABLE "ExerciseOffering"`);
    }

}
