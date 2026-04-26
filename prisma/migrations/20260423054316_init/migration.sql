/*
  Warnings:

  - You are about to drop the `GameSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameSchedulePuzzle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameScheduleQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'ADMIN', 'CLIENT', 'RIGADMIN');

-- DropForeignKey
ALTER TABLE "GameSchedulePuzzle" DROP CONSTRAINT "GameSchedulePuzzle_gameScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "GameSchedulePuzzle" DROP CONSTRAINT "GameSchedulePuzzle_puzzleId_fkey";

-- DropForeignKey
ALTER TABLE "GameScheduleQuestion" DROP CONSTRAINT "GameScheduleQuestion_gameScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "GameScheduleQuestion" DROP CONSTRAINT "GameScheduleQuestion_questionId_fkey";

-- DropTable
DROP TABLE "GameSchedule";

-- DropTable
DROP TABLE "GameSchedulePuzzle";

-- DropTable
DROP TABLE "GameScheduleQuestion";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "messsage" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "typeId" INTEGER,
    "userType" "UserType" NOT NULL,
    "userId" INTEGER,
    "clientId" INTEGER,
    "adminId" INTEGER,
    "rigAdminId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
