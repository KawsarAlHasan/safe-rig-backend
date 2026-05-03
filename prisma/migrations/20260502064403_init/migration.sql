/*
  Warnings:

  - You are about to drop the `Feature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanFeature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlanFeature" DROP CONSTRAINT "PlanFeature_featureId_fkey";

-- DropForeignKey
ALTER TABLE "PlanFeature" DROP CONSTRAINT "PlanFeature_planId_fkey";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "features" JSONB;

-- DropTable
DROP TABLE "Feature";

-- DropTable
DROP TABLE "PlanFeature";
