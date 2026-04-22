-- AlterTable
ALTER TABLE "GameSchedule" ALTER COLUMN "scheduledFor" DROP NOT NULL,
ALTER COLUMN "scheduledFor" SET DATA TYPE TEXT;
