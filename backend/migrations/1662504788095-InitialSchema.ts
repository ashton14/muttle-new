import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialSchema1662504788095 implements MigrationInterface {
    name = 'InitialSchema1662504788095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "TestCase" ("id" SERIAL NOT NULL, "input" character varying, "output" character varying, "fixedId" integer, "passed" boolean, "actual" character varying, "visible" boolean DEFAULT true, "errorMessage" character varying, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "exerciseId" integer, "userId" integer, CONSTRAINT "PK_392c5650e1a4ebb5907f422d028" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Exercise" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "snippet" text NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5897c562f3162fc527c0013f9f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "CoverageOutcome" ("id" SERIAL NOT NULL, "lineNo" integer NOT NULL, "lineCovered" boolean NOT NULL DEFAULT false, "conditions" integer NOT NULL DEFAULT '0', "conditionsCovered" integer NOT NULL DEFAULT '0', "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "attemptId" integer, CONSTRAINT "PK_534873cda0036b272aab7fa5f30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "MutatedLine" ("id" SERIAL NOT NULL, "lineNo" integer NOT NULL, "mutatedSource" character varying NOT NULL, "mutationId" integer, CONSTRAINT "PK_f31bca613e1429b1e3300b8ac0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Mutation" ("id" SERIAL NOT NULL, "operator" character varying NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "mutationOutcomeId" integer, CONSTRAINT "PK_c3c54a87c6b41c8d884afae1565" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "MutationOutcome" ("id" SERIAL NOT NULL, "exception_traceback" text, "killer" character varying, "module" character varying, "number" integer NOT NULL, "status" character varying NOT NULL, "tests_run" integer NOT NULL, "time" integer NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "attemptId" integer, CONSTRAINT "PK_149b20a23c40585c4b428dc3d68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Attempt" ("id" SERIAL NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "exerciseId" integer, "userId" integer, CONSTRAINT "PK_c437bfc190927c45d83764769fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attempt_test_cases__test_case" ("attemptId" integer NOT NULL, "testCaseId" integer NOT NULL, CONSTRAINT "PK_40b7725cde1529bfdc482e2c4c1" PRIMARY KEY ("attemptId", "testCaseId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f37b4464a684ec9c5010794264" ON "attempt_test_cases__test_case" ("attemptId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1d2f680c7ed1c870a6f803f453" ON "attempt_test_cases__test_case" ("testCaseId") `);
        await queryRunner.query(`ALTER TABLE "TestCase" ADD CONSTRAINT "FK_2483529d4cb6a177fd66ceab08d" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "TestCase" ADD CONSTRAINT "FK_771ccd4bb9a9c0aa206b1a55a94" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CoverageOutcome" ADD CONSTRAINT "FK_c56d6213646bce79c31c4605b2d" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "MutatedLine" ADD CONSTRAINT "FK_777160c76b03052b9f3c48e87fe" FOREIGN KEY ("mutationId") REFERENCES "Mutation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Mutation" ADD CONSTRAINT "FK_692625eb77583f859e9278e9285" FOREIGN KEY ("mutationOutcomeId") REFERENCES "MutationOutcome"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "MutationOutcome" ADD CONSTRAINT "FK_dc337474bb02dbed494538447dd" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Attempt" ADD CONSTRAINT "FK_75c8dab8abd9d09ad7e4c73e920" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Attempt" ADD CONSTRAINT "FK_b69a8d497c215e8b9f1638d1c6d" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempt_test_cases__test_case" ADD CONSTRAINT "FK_f37b4464a684ec9c5010794264e" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempt_test_cases__test_case" ADD CONSTRAINT "FK_1d2f680c7ed1c870a6f803f4534" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attempt_test_cases__test_case" DROP CONSTRAINT "FK_1d2f680c7ed1c870a6f803f4534"`);
        await queryRunner.query(`ALTER TABLE "attempt_test_cases__test_case" DROP CONSTRAINT "FK_f37b4464a684ec9c5010794264e"`);
        await queryRunner.query(`ALTER TABLE "Attempt" DROP CONSTRAINT "FK_b69a8d497c215e8b9f1638d1c6d"`);
        await queryRunner.query(`ALTER TABLE "Attempt" DROP CONSTRAINT "FK_75c8dab8abd9d09ad7e4c73e920"`);
        await queryRunner.query(`ALTER TABLE "MutationOutcome" DROP CONSTRAINT "FK_dc337474bb02dbed494538447dd"`);
        await queryRunner.query(`ALTER TABLE "Mutation" DROP CONSTRAINT "FK_692625eb77583f859e9278e9285"`);
        await queryRunner.query(`ALTER TABLE "MutatedLine" DROP CONSTRAINT "FK_777160c76b03052b9f3c48e87fe"`);
        await queryRunner.query(`ALTER TABLE "CoverageOutcome" DROP CONSTRAINT "FK_c56d6213646bce79c31c4605b2d"`);
        await queryRunner.query(`ALTER TABLE "TestCase" DROP CONSTRAINT "FK_771ccd4bb9a9c0aa206b1a55a94"`);
        await queryRunner.query(`ALTER TABLE "TestCase" DROP CONSTRAINT "FK_2483529d4cb6a177fd66ceab08d"`);
        await queryRunner.query(`DROP INDEX "IDX_1d2f680c7ed1c870a6f803f453"`);
        await queryRunner.query(`DROP INDEX "IDX_f37b4464a684ec9c5010794264"`);
        await queryRunner.query(`DROP TABLE "attempt_test_cases__test_case"`);
        await queryRunner.query(`DROP TABLE "Attempt"`);
        await queryRunner.query(`DROP TABLE "MutationOutcome"`);
        await queryRunner.query(`DROP TABLE "Mutation"`);
        await queryRunner.query(`DROP TABLE "MutatedLine"`);
        await queryRunner.query(`DROP TABLE "CoverageOutcome"`);
        await queryRunner.query(`DROP TABLE "Exercise"`);
        await queryRunner.query(`DROP TABLE "TestCase"`);
        await queryRunner.query(`DROP TABLE "User"`);
    }

}
