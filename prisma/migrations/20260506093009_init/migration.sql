-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PEANDING';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "coupon" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PEANDING';
