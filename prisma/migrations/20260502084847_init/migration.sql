/*
  Warnings:

  - You are about to drop the column `querterPrice` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "querterPrice",
ADD COLUMN     "quarterPrice" DOUBLE PRECISION;
