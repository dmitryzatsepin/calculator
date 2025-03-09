/*
  Warnings:

  - The primary key for the `Cabinet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ModulesQ` on the `Cabinet` table. All the data in the column will be lost.
  - The `id` column on the `Cabinet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PixelStep` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PixelStep` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name,type]` on the table `Cabinet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,name]` on the table `PixelStep` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `modulesQ` to the `Cabinet` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Cabinet_name_key";

-- DropIndex
DROP INDEX "PixelStep_name_key";

-- AlterTable
ALTER TABLE "Cabinet" DROP CONSTRAINT "Cabinet_pkey",
DROP COLUMN "ModulesQ",
ADD COLUMN     "modulesQ" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PixelStep" DROP CONSTRAINT "PixelStep_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PixelStep_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_name_type_key" ON "Cabinet"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PixelStep_type_name_key" ON "PixelStep"("type", "name");
