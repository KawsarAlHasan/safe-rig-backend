/*
  Warnings:

  - You are about to drop the column `mark1x` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the column `mark1y` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the column `mark2x` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the column `mark2y` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the column `mark3x` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the column `mark3y` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the column `mark4x` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the column `mark4y` on the `Puzzle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Puzzle" DROP COLUMN "mark1x",
DROP COLUMN "mark1y",
DROP COLUMN "mark2x",
DROP COLUMN "mark2y",
DROP COLUMN "mark3x",
DROP COLUMN "mark3y",
DROP COLUMN "mark4x",
DROP COLUMN "mark4y",
ADD COLUMN     "marks" JSONB;
