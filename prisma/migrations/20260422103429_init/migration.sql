-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "scheduledFor" TEXT,
    "gameType" "GameType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "puzzleIds" INTEGER[],
    "questionIds" INTEGER[],

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);
