import {MigrationInterface, QueryRunner} from "typeorm";

export class MergeMutationsandMutationOutcomes1662606276004 implements MigrationInterface {
    name = 'MergeMutationsandMutationOutcomes1662606276004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "MutatedLine" DROP CONSTRAINT "FK_777160c76b03052b9f3c48e87fe"`);
        await queryRunner.query(`ALTER TABLE "MutatedLine" RENAME COLUMN "mutationId" TO "mutationOutcomeId"`);
        await queryRunner.query(`ALTER TABLE "MutationOutcome" ADD "operator" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "MutatedLine" ADD CONSTRAINT "FK_4707e7df45d6a7f9acdf3d48e42" FOREIGN KEY ("mutationOutcomeId") REFERENCES "MutationOutcome"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "MutatedLine" DROP CONSTRAINT "FK_4707e7df45d6a7f9acdf3d48e42"`);
        await queryRunner.query(`ALTER TABLE "MutationOutcome" DROP COLUMN "operator"`);
        await queryRunner.query(`ALTER TABLE "MutatedLine" RENAME COLUMN "mutationOutcomeId" TO "mutationId"`);
        await queryRunner.query(`ALTER TABLE "MutatedLine" ADD CONSTRAINT "FK_777160c76b03052b9f3c48e87fe" FOREIGN KEY ("mutationId") REFERENCES "Mutation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
