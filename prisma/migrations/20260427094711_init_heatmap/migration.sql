-- CreateEnum
CREATE TYPE "HeatmapStatus" AS ENUM ('COMPLETE', 'PENDING', 'CANCEL', 'REJECTED');

-- CreateTable
CREATE TABLE "Heatmap" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "rigId" INTEGER,
    "image" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "status" "HeatmapStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Heatmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeatmapArea" (
    "id" SERIAL NOT NULL,
    "heatmapId" INTEGER NOT NULL,
    "areaId" INTEGER,
    "points" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeatmapArea_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Heatmap" ADD CONSTRAINT "Heatmap_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Heatmap" ADD CONSTRAINT "Heatmap_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeatmapArea" ADD CONSTRAINT "HeatmapArea_heatmapId_fkey" FOREIGN KEY ("heatmapId") REFERENCES "Heatmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeatmapArea" ADD CONSTRAINT "HeatmapArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
