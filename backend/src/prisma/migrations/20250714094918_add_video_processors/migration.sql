-- CreateTable
CREATE TABLE "video_processors" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxResolutionX" INTEGER NOT NULL,
    "maxResolutionY" INTEGER NOT NULL,
    "priceUsd" DECIMAL(12,2),
    "priceRub" DECIMAL(12,2),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "video_processors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_processors_code_key" ON "video_processors"("code");
