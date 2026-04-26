/*
  Warnings:

  - Changed the type of `score` on the `GameResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalScore` on the `GameResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "GameResult" DROP COLUMN "score",
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
DROP COLUMN "totalScore",
ADD COLUMN     "totalScore" DOUBLE PRECISION NOT NULL;
