/*
  Warnings:

  - A unique constraint covering the columns `[companyId,isMainClient]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Client_companyId_isMainClient_key" ON "Client"("companyId", "isMainClient");
