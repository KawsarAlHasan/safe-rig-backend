-- CreateTable
CREATE TABLE "Puzzle" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT,
    "mark1x" INTEGER NOT NULL,
    "mark1y" INTEGER NOT NULL,
    "mark2x" INTEGER NOT NULL,
    "mark2y" INTEGER NOT NULL,
    "mark3x" INTEGER NOT NULL,
    "mark3y" INTEGER NOT NULL,
    "mark4x" INTEGER NOT NULL,
    "mark4y" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "status" "AllStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);
