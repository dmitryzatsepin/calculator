/*
  Warnings:

  - Added the required column `type` to the `ScreenType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScreenType" ADD COLUMN     "type" TEXT NOT NULL;
