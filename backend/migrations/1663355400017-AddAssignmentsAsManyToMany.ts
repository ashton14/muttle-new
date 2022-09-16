import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAssignmentsAsManyToMany1663355400017 implements MigrationInterface {
    name = 'AddAssignmentsAsManyToMany1663355400017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_exercise_offerings__exercise_offering" ("userId" integer NOT NULL, "exerciseOfferingId" integer NOT NULL, CONSTRAINT "PK_235320283fbd0b2a37faed5fb35" PRIMARY KEY ("userId", "exerciseOfferingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bb8db253c1602fd6ee29fef03f" ON "user_exercise_offerings__exercise_offering" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d88950fb6f62e8db0f9ff4b891" ON "user_exercise_offerings__exercise_offering" ("exerciseOfferingId") `);
        await queryRunner.query(`COMMENT ON COLUMN "ExerciseOffering"."mutators" IS NULL`);
        await queryRunner.query(`ALTER TABLE "ExerciseOffering" ALTER COLUMN "mutators" SET DEFAULT array[]::text[]`);
        await queryRunner.query(`ALTER TABLE "user_exercise_offerings__exercise_offering" ADD CONSTRAINT "FK_bb8db253c1602fd6ee29fef03fc" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_exercise_offerings__exercise_offering" ADD CONSTRAINT "FK_d88950fb6f62e8db0f9ff4b8913" FOREIGN KEY ("exerciseOfferingId") REFERENCES "ExerciseOffering"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_exercise_offerings__exercise_offering" DROP CONSTRAINT "FK_d88950fb6f62e8db0f9ff4b8913"`);
        await queryRunner.query(`ALTER TABLE "user_exercise_offerings__exercise_offering" DROP CONSTRAINT "FK_bb8db253c1602fd6ee29fef03fc"`);
        await queryRunner.query(`ALTER TABLE "ExerciseOffering" ALTER COLUMN "mutators" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "ExerciseOffering"."mutators" IS NULL`);
        await queryRunner.query(`DROP INDEX "IDX_d88950fb6f62e8db0f9ff4b891"`);
        await queryRunner.query(`DROP INDEX "IDX_bb8db253c1602fd6ee29fef03f"`);
        await queryRunner.query(`DROP TABLE "user_exercise_offerings__exercise_offering"`);
    }

}
