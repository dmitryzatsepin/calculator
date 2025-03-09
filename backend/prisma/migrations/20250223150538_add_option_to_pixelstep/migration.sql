/*
  Warnings:

  - Added the required column `option` to the `PixelStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PixelStep" ADD COLUMN     "option" TEXT NOT NULL;
