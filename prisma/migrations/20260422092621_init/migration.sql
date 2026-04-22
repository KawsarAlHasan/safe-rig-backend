/*
  Warnings:

  - You are about to drop the column `puzzleId` on the `GameSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `questionAnwserId` on the `GameSchedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameSchedule" DROP CONSTRAINT "GameSchedule_puzzleId_fkey";

-- DropForeignKey
ALTER TABLE "GameSchedule" DROP CONSTRAINT "GameSchedule_questionAnwserId_fkey";

-- AlterTable
ALTER TABLE "GameSchedule" DROP COLUMN "puzzleId",
DROP COLUMN "questionAnwserId";

-- AlterTable
ALTER TABLE "GameScheduleQuestion" ALTER COLUMN "questionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GameSchedulePuzzle" ADD CONSTRAINT "GameSchedulePuzzle_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameScheduleQuestion" ADD CONSTRAINT "GameScheduleQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionAnwser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
