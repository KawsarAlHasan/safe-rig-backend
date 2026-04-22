-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('PUZZLE', 'QUESTION');

-- CreateTable
CREATE TABLE "GameSchedule" (
    "id" SERIAL NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "gameType" "GameType" NOT NULL,
    "puzzleId" INTEGER,
    "questionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameSchedule" ADD CONSTRAINT "GameSchedule_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSchedule" ADD CONSTRAINT "GameSchedule_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionAnwser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
