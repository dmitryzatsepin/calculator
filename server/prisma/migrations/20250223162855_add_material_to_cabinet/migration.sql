/*
  Warnings:

  - Added the required column `material` to the `Cabinet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cabinet" ADD COLUMN     "material" TEXT NOT NULL;
