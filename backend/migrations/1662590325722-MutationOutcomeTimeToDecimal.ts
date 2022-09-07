import {MigrationInterface, QueryRunner} from "typeorm";

export class MutationOutcomeTimeToDecimal1662590325722 implements MigrationInterface {
    name = 'MutationOutcomeTimeToDecimal1662590325722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "MutationOutcome" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "MutationOutcome" ADD "time" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "MutationOutcome" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "MutationOutcome" ADD "time" integer NOT NULL`);
    }

}
