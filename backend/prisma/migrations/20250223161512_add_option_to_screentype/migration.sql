-- CreateTable
CREATE TABLE "ScreenType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "screenOption" TEXT[],

    CONSTRAINT "ScreenType_pkey" PRIMARY KEY ("id")
);
