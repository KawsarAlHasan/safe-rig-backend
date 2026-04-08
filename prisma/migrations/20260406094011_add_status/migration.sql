/*
  Warnings:

  - The `status` column on the `Admin` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AllStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "status",
ADD COLUMN     "status" "AllStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "AdminRole" ADD COLUMN     "status" "AllStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "AdminStatus";
