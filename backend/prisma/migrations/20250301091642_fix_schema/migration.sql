/*
  Warnings:

  - You are about to drop the column `pixelOption` on the `Cabinet` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Cabinet` table. All the data in the column will be lost.
  - The `option` column on the `PixelStep` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `screenOption` on the `ScreenType` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ScreenType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,location]` on the table `Cabinet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,location]` on the table `PixelStep` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location` to the `Cabinet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placement` to the `Cabinet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `PixelStep` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Cabinet_name_type_key";

-- DropIndex
DROP INDEX "PixelStep_type_name_key";

-- AlterTable
ALTER TABLE "Cabinet" DROP COLUMN "pixelOption",
DROP COLUMN "type",
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "material" TEXT[],
ADD COLUMN     "pixelStep" TEXT[],
ADD COLUMN     "placement" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PixelStep" ADD COLUMN     "location" TEXT NOT NULL,
DROP COLUMN "option",
ADD COLUMN     "option" TEXT[];

-- AlterTable
ALTER TABLE "ScreenType" DROP COLUMN "screenOption",
DROP COLUMN "type",
ADD COLUMN     "material" TEXT[],
ADD COLUMN     "option" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_name_location_key" ON "Cabinet"("name", "location");

-- CreateIndex
CREATE UNIQUE INDEX "PixelStep_name_location_key" ON "PixelStep"("name", "location");
