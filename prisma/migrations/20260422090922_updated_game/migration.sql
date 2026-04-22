/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `GameSchedulePuzzle` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleId` on the `GameScheduleQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameSchedulePuzzle" DROP COLUMN "scheduleId";

-- AlterTable
ALTER TABLE "GameScheduleQuestion" DROP COLUMN "scheduleId";
