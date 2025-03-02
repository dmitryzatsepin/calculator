/*
  Warnings:

  - Added the required column `brightness` to the `PixelStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshFreq` to the `PixelStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PixelStep" ADD COLUMN     "brightness" INTEGER NOT NULL,
ADD COLUMN     "refreshFreq" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "IngressProtection" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "hardObjectProtection" TEXT NOT NULL,
    "waterProtection" TEXT NOT NULL,

    CONSTRAINT "IngressProtection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngressProtection_code_key" ON "IngressProtection"("code");
