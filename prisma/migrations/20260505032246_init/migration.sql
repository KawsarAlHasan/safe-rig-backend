-- DropForeignKey
ALTER TABLE "CardSubmission" DROP CONSTRAINT "CardSubmission_areaId_fkey";

-- DropForeignKey
ALTER TABLE "CardSubmission" DROP CONSTRAINT "CardSubmission_cardTypeId_fkey";

-- DropForeignKey
ALTER TABLE "CardSubmission" DROP CONSTRAINT "CardSubmission_hazardId_fkey";

-- AlterTable
ALTER TABLE "CardSubmission" ALTER COLUMN "cardTypeId" DROP NOT NULL,
ALTER COLUMN "areaId" DROP NOT NULL,
ALTER COLUMN "hazardId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CardSubmission" ADD CONSTRAINT "CardSubmission_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "CardType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSubmission" ADD CONSTRAINT "CardSubmission_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSubmission" ADD CONSTRAINT "CardSubmission_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "Hazard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
