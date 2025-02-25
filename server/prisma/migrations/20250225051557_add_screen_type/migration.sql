/*
  Warnings:

  - You are about to drop the column `material` on the `Cabinet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `ScreenType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cabinet" DROP COLUMN "material";

-- CreateIndex
CREATE UNIQUE INDEX "ScreenType_name_key" ON "ScreenType"("name");
