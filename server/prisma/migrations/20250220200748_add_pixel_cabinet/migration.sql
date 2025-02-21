-- CreateTable
CREATE TABLE "PixelStep" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "PixelStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cabinet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "ModulesQ" INTEGER NOT NULL,
    "powerUnitCapacity" INTEGER NOT NULL,
    "powerUnitQ" INTEGER NOT NULL,
    "receiver" INTEGER NOT NULL,
    "cooler" INTEGER NOT NULL,
    "pixelOption" TEXT[],

    CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PixelStep_name_key" ON "PixelStep"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_name_key" ON "Cabinet"("name");
