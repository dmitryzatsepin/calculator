-- CreateTable
CREATE TABLE "PartPrice" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "priceUsd" DOUBLE PRECISION DEFAULT 0,
    "priceRub" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "PartPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartPrice_name_key" ON "PartPrice"("name");
