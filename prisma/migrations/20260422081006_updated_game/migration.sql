/*
  Warnings:

  - You are about to drop the column `questionId` on the `GameSchedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameSchedule" DROP CONSTRAINT "GameSchedule_questionId_fkey";

-- AlterTable
ALTER TABLE "GameSchedule" DROP COLUMN "questionId",
ADD COLUMN     "questionAnwserId" INTEGER;

-- CreateTable
CREATE TABLE "GameSchedulePuzzle" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "puzzleId" INTEGER,
    "gameScheduleId" INTEGER,

    CONSTRAINT "GameSchedulePuzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameScheduleQuestion" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "gameScheduleId" INTEGER,

    CONSTRAINT "GameScheduleQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameSchedule" ADD CONSTRAINT "GameSchedule_questionAnwserId_fkey" FOREIGN KEY ("questionAnwserId") REFERENCES "QuestionAnwser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSchedulePuzzle" ADD CONSTRAINT "GameSchedulePuzzle_gameScheduleId_fkey" FOREIGN KEY ("gameScheduleId") REFERENCES "GameSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameScheduleQuestion" ADD CONSTRAINT "GameScheduleQuestion_gameScheduleId_fkey" FOREIGN KEY ("gameScheduleId") REFERENCES "GameSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
