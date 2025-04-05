-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" SERIAL NOT NULL,
    "option_code" TEXT NOT NULL,
    "option_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" SERIAL NOT NULL,
    "manufacturer_code" TEXT NOT NULL,
    "manufacturer_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_types" (
    "id" SERIAL NOT NULL,
    "screen_type" TEXT NOT NULL,
    "screen_brightness" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screen_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_protection" (
    "id" SERIAL NOT NULL,
    "ip_code" TEXT NOT NULL,
    "protection_solid" TEXT NOT NULL,
    "protection_water" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_protection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_service_price" (
    "id" SERIAL NOT NULL,
    "component_category" TEXT,
    "component_code" TEXT NOT NULL,
    "component_name" TEXT NOT NULL,
    "price_usd" DECIMAL(12,2),
    "price_rub" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_service_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pixel_step_definitions" (
    "id" SERIAL NOT NULL,
    "pixel_code" TEXT NOT NULL,
    "pixel_step" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pixel_step_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pixel_types" (
    "id" SERIAL NOT NULL,
    "pixel_type" TEXT NOT NULL,
    "pixel_frequency" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pixel_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pixel_options" (
    "id" SERIAL NOT NULL,
    "pixel_code" TEXT NOT NULL,
    "module_width" INTEGER NOT NULL,
    "module_height" INTEGER NOT NULL,
    "optionName" TEXT,
    "pixelTypeId" INTEGER,
    "screenTypeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pixel_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" SERIAL NOT NULL,
    "module_sku" TEXT NOT NULL,
    "module_type" TEXT,
    "module_width" INTEGER NOT NULL,
    "module_height" INTEGER NOT NULL,
    "module_frequency" INTEGER,
    "module_brightness" INTEGER,
    "price_usd" DECIMAL(12,2),
    "manufacturerCode" TEXT,
    "screenTypeId" INTEGER NOT NULL,
    "pixel_code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinets" (
    "id" SERIAL NOT NULL,
    "cabinet_sku" TEXT NOT NULL,
    "cabinet_name" TEXT,
    "cabinet_width" INTEGER,
    "cabinet_height" INTEGER,
    "cabinet_placement" TEXT,
    "module_width" INTEGER,
    "module_height" INTEGER,
    "modules_count" INTEGER,
    "price_usd" DECIMAL(12,2),
    "screenTypeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cabinets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_type_materials" (
    "screen_type_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,

    CONSTRAINT "screen_type_materials_pkey" PRIMARY KEY ("screen_type_id","material_id")
);

-- CreateTable
CREATE TABLE "screen_type_options" (
    "screen_type_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,

    CONSTRAINT "screen_type_options_pkey" PRIMARY KEY ("screen_type_id","option_id")
);

-- CreateTable
CREATE TABLE "cabinet_materials" (
    "cabinet_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,

    CONSTRAINT "cabinet_materials_pkey" PRIMARY KEY ("cabinet_id","material_id")
);

-- CreateTable
CREATE TABLE "cabinet_components" (
    "cabinet_id" INTEGER NOT NULL,
    "component_id" INTEGER NOT NULL,
    "component_count" INTEGER NOT NULL,

    CONSTRAINT "cabinet_components_pkey" PRIMARY KEY ("cabinet_id","component_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "materials_material_code_key" ON "materials"("material_code");

-- CreateIndex
CREATE UNIQUE INDEX "options_option_code_key" ON "options"("option_code");

-- CreateIndex
CREATE UNIQUE INDEX "options_option_name_key" ON "options"("option_name");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_manufacturer_code_key" ON "manufacturers"("manufacturer_code");

-- CreateIndex
CREATE UNIQUE INDEX "screen_types_screen_type_key" ON "screen_types"("screen_type");

-- CreateIndex
CREATE UNIQUE INDEX "ip_protection_ip_code_key" ON "ip_protection"("ip_code");

-- CreateIndex
CREATE UNIQUE INDEX "component_service_price_component_code_key" ON "component_service_price"("component_code");

-- CreateIndex
CREATE UNIQUE INDEX "pixel_step_definitions_pixel_code_key" ON "pixel_step_definitions"("pixel_code");

-- CreateIndex
CREATE UNIQUE INDEX "pixel_types_pixel_type_key" ON "pixel_types"("pixel_type");

-- CreateIndex
CREATE INDEX "pixel_options_pixel_code_idx" ON "pixel_options"("pixel_code");

-- CreateIndex
CREATE UNIQUE INDEX "modules_module_sku_key" ON "modules"("module_sku");

-- CreateIndex
CREATE UNIQUE INDEX "cabinets_cabinet_sku_key" ON "cabinets"("cabinet_sku");

-- AddForeignKey
ALTER TABLE "pixel_options" ADD CONSTRAINT "pixel_options_pixel_code_fkey" FOREIGN KEY ("pixel_code") REFERENCES "pixel_step_definitions"("pixel_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pixel_options" ADD CONSTRAINT "pixel_options_pixelTypeId_fkey" FOREIGN KEY ("pixelTypeId") REFERENCES "pixel_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pixel_options" ADD CONSTRAINT "pixel_options_screenTypeId_fkey" FOREIGN KEY ("screenTypeId") REFERENCES "screen_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_manufacturerCode_fkey" FOREIGN KEY ("manufacturerCode") REFERENCES "manufacturers"("manufacturer_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_screenTypeId_fkey" FOREIGN KEY ("screenTypeId") REFERENCES "screen_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_pixel_code_fkey" FOREIGN KEY ("pixel_code") REFERENCES "pixel_step_definitions"("pixel_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinets" ADD CONSTRAINT "cabinets_screenTypeId_fkey" FOREIGN KEY ("screenTypeId") REFERENCES "screen_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_materials" ADD CONSTRAINT "screen_type_materials_screen_type_id_fkey" FOREIGN KEY ("screen_type_id") REFERENCES "screen_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_materials" ADD CONSTRAINT "screen_type_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_options" ADD CONSTRAINT "screen_type_options_screen_type_id_fkey" FOREIGN KEY ("screen_type_id") REFERENCES "screen_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_options" ADD CONSTRAINT "screen_type_options_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_materials" ADD CONSTRAINT "cabinet_materials_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_materials" ADD CONSTRAINT "cabinet_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_components" ADD CONSTRAINT "cabinet_components_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_components" ADD CONSTRAINT "cabinet_components_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "component_service_price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
