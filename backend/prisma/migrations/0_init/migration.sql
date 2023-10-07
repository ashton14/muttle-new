-- CreateTable
CREATE TABLE "Attempt" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exerciseId" INTEGER,
    "exerciseOfferingId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "PK_c437bfc190927c45d83764769fb" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageOutcome" (
    "id" SERIAL NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "lineCovered" BOOLEAN NOT NULL DEFAULT false,
    "conditions" INTEGER NOT NULL DEFAULT 0,
    "conditionsCovered" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptId" INTEGER,

    CONSTRAINT "PK_534873cda0036b272aab7fa5f30" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER,

    CONSTRAINT "PK_5897c562f3162fc527c0013f9f5" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseOffering" (
    "id" SERIAL NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "conditionCoverage" BOOLEAN NOT NULL DEFAULT true,
    "mutators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minTests" INTEGER DEFAULT 1,
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exerciseId" INTEGER,
    "ownerId" INTEGER,

    CONSTRAINT "PK_1e9ba3d99ab443be1b36a034a62" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutatedLine" (
    "id" SERIAL NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "mutatedSource" VARCHAR NOT NULL,
    "mutationOutcomeId" INTEGER,

    CONSTRAINT "PK_f31bca613e1429b1e3300b8ac0a" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutationOutcome" (
    "id" SERIAL NOT NULL,
    "operator" TEXT NOT NULL,
    "exception_traceback" TEXT,
    "killer" VARCHAR,
    "module" VARCHAR,
    "number" INTEGER NOT NULL,
    "status" VARCHAR NOT NULL,
    "tests_run" INTEGER NOT NULL,
    "time" DECIMAL NOT NULL,
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptId" INTEGER,

    CONSTRAINT "PK_149b20a23c40585c4b428dc3d68" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" SERIAL NOT NULL,
    "input" VARCHAR,
    "output" VARCHAR,
    "fixedId" INTEGER,
    "passed" BOOLEAN,
    "actual" VARCHAR,
    "visible" BOOLEAN DEFAULT true,
    "errorMessage" VARCHAR,
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exerciseId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "PK_392c5650e1a4ebb5907f422d028" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_test_cases__test_case" (
    "attemptId" INTEGER NOT NULL,
    "testCaseId" INTEGER NOT NULL,

    CONSTRAINT "PK_40b7725cde1529bfdc482e2c4c1" PRIMARY KEY ("attemptId","testCaseId")
);

-- CreateTable
CREATE TABLE "user_exercise_offerings__exercise_offering" (
    "userId" INTEGER NOT NULL,
    "exerciseOfferingId" INTEGER NOT NULL,

    CONSTRAINT "PK_235320283fbd0b2a37faed5fb35" PRIMARY KEY ("userId","exerciseOfferingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_d173e2acfcf148db1a2810f7d1e" ON "ExerciseOffering"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_4a257d2c9837248d70640b3e36e" ON "User"("email");

-- CreateIndex
CREATE INDEX "IDX_1d2f680c7ed1c870a6f803f453" ON "attempt_test_cases__test_case"("testCaseId");

-- CreateIndex
CREATE INDEX "IDX_f37b4464a684ec9c5010794264" ON "attempt_test_cases__test_case"("attemptId");

-- CreateIndex
CREATE INDEX "IDX_bb8db253c1602fd6ee29fef03f" ON "user_exercise_offerings__exercise_offering"("userId");

-- CreateIndex
CREATE INDEX "IDX_d88950fb6f62e8db0f9ff4b891" ON "user_exercise_offerings__exercise_offering"("exerciseOfferingId");

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "FK_0e0c7d230d28a5a9e03ecfc29e2" FOREIGN KEY ("exerciseOfferingId") REFERENCES "ExerciseOffering"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "FK_75c8dab8abd9d09ad7e4c73e920" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "FK_b69a8d497c215e8b9f1638d1c6d" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CoverageOutcome" ADD CONSTRAINT "FK_c56d6213646bce79c31c4605b2d" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "FK_faad9cb06cc306a1a37bfcca834" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExerciseOffering" ADD CONSTRAINT "FK_973007516ea36e0784b0dbcfe1d" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExerciseOffering" ADD CONSTRAINT "FK_e9f2fb00bf2bb45db97b9c4ad6c" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MutatedLine" ADD CONSTRAINT "FK_4707e7df45d6a7f9acdf3d48e42" FOREIGN KEY ("mutationOutcomeId") REFERENCES "MutationOutcome"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MutationOutcome" ADD CONSTRAINT "FK_dc337474bb02dbed494538447dd" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "FK_2483529d4cb6a177fd66ceab08d" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "FK_771ccd4bb9a9c0aa206b1a55a94" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt_test_cases__test_case" ADD CONSTRAINT "FK_1d2f680c7ed1c870a6f803f4534" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt_test_cases__test_case" ADD CONSTRAINT "FK_f37b4464a684ec9c5010794264e" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_exercise_offerings__exercise_offering" ADD CONSTRAINT "FK_bb8db253c1602fd6ee29fef03fc" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_exercise_offerings__exercise_offering" ADD CONSTRAINT "FK_d88950fb6f62e8db0f9ff4b8913" FOREIGN KEY ("exerciseOfferingId") REFERENCES "ExerciseOffering"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

