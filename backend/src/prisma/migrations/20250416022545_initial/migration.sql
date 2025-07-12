-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_types" (
    "id" SERIAL NOT NULL,
    "screen_type_code" TEXT NOT NULL,
    "screen_type_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screen_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "location_code" TEXT NOT NULL,
    "location_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" SERIAL NOT NULL,
    "placement_code" TEXT NOT NULL,
    "placement_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" SERIAL NOT NULL,
    "option_code" TEXT NOT NULL,
    "option_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" SERIAL NOT NULL,
    "sensor_code" TEXT NOT NULL,
    "sensor" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_types" (
    "id" SERIAL NOT NULL,
    "control_type_code" TEXT NOT NULL,
    "control_type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pitches" (
    "id" SERIAL NOT NULL,
    "pitch_code" TEXT NOT NULL,
    "pitch" DECIMAL(5,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pitches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_rates" (
    "id" SERIAL NOT NULL,
    "refresh_rate_code" TEXT NOT NULL,
    "refresh_rate" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brightness_values" (
    "id" SERIAL NOT NULL,
    "brightness_code" TEXT NOT NULL,
    "brightness" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brightness_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" SERIAL NOT NULL,
    "manufacturer_code" TEXT NOT NULL,
    "manufacturer_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_protection" (
    "id" SERIAL NOT NULL,
    "ip_code" TEXT NOT NULL,
    "protection_solid" TEXT NOT NULL,
    "protection_water" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_protection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_sizes" (
    "id" SERIAL NOT NULL,
    "module_size_code" TEXT NOT NULL,
    "module_size" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinet_sizes" (
    "id" SERIAL NOT NULL,
    "cabinet_size_code" TEXT NOT NULL,
    "cabinet_size" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cabinet_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_categories" (
    "id" SERIAL NOT NULL,
    "item_category_code" TEXT NOT NULL,
    "item_category_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_subcategories" (
    "id" SERIAL NOT NULL,
    "item_subcategory_code" TEXT NOT NULL,
    "item_subcategory_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinets" (
    "id" SERIAL NOT NULL,
    "cabinet_code" TEXT NOT NULL,
    "cabinet_sku" TEXT,
    "cabinet_name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cabinets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" SERIAL NOT NULL,
    "module_code" TEXT NOT NULL,
    "module_sku" TEXT,
    "module_name" TEXT,
    "module_option" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_sku" TEXT,
    "item_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_type_options" (
    "screen_type_code" TEXT NOT NULL,
    "option_code" TEXT NOT NULL,

    CONSTRAINT "screen_type_options_pkey" PRIMARY KEY ("screen_type_code","option_code")
);

-- CreateTable
CREATE TABLE "screen_type_control_types" (
    "screen_type_code" TEXT NOT NULL,
    "control_type_code" TEXT NOT NULL,

    CONSTRAINT "screen_type_control_types_pkey" PRIMARY KEY ("screen_type_code","control_type_code")
);

-- CreateTable
CREATE TABLE "screen_type_sensors" (
    "screen_type_code" TEXT NOT NULL,
    "sensor_code" TEXT NOT NULL,

    CONSTRAINT "screen_type_sensors_pkey" PRIMARY KEY ("screen_type_code","sensor_code")
);

-- CreateTable
CREATE TABLE "item_categories_items" (
    "item_code" TEXT NOT NULL,
    "item_category_code" TEXT NOT NULL,

    CONSTRAINT "item_categories_items_pkey" PRIMARY KEY ("item_code","item_category_code")
);

-- CreateTable
CREATE TABLE "item_subcategories_items" (
    "item_code" TEXT NOT NULL,
    "item_subcategory_code" TEXT NOT NULL,

    CONSTRAINT "item_subcategories_items_pkey" PRIMARY KEY ("item_code","item_subcategory_code")
);

-- CreateTable
CREATE TABLE "item_prices" (
    "item_code" TEXT NOT NULL,
    "price_usd" DECIMAL(12,2),
    "price_rub" DECIMAL(12,2),

    CONSTRAINT "item_prices_pkey" PRIMARY KEY ("item_code")
);

-- CreateTable
CREATE TABLE "item_suppliers" (
    "item_code" TEXT NOT NULL,
    "supplier_code" TEXT NOT NULL,

    CONSTRAINT "item_suppliers_pkey" PRIMARY KEY ("item_code","supplier_code")
);

-- CreateTable
CREATE TABLE "item_category_subcategories" (
    "item_category_code" TEXT NOT NULL,
    "item_subcategory_code" TEXT NOT NULL,

    CONSTRAINT "item_category_subcategories_pkey" PRIMARY KEY ("item_category_code","item_subcategory_code")
);

-- CreateTable
CREATE TABLE "cabinet_categories" (
    "cabinet_code" TEXT NOT NULL,
    "item_category_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_categories_pkey" PRIMARY KEY ("cabinet_code","item_category_code")
);

-- CreateTable
CREATE TABLE "cabinet_subcategories" (
    "cabinet_code" TEXT NOT NULL,
    "item_subcategory_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_subcategories_pkey" PRIMARY KEY ("cabinet_code","item_subcategory_code")
);

-- CreateTable
CREATE TABLE "cabinet_locations" (
    "cabinet_code" TEXT NOT NULL,
    "location_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_locations_pkey" PRIMARY KEY ("cabinet_code","location_code")
);

-- CreateTable
CREATE TABLE "cabinet_placements_cabinets" (
    "cabinet_code" TEXT NOT NULL,
    "placement_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_placements_cabinets_pkey" PRIMARY KEY ("cabinet_code","placement_code")
);

-- CreateTable
CREATE TABLE "cabinet_materials" (
    "cabinet_code" TEXT NOT NULL,
    "material_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_materials_pkey" PRIMARY KEY ("cabinet_code","material_code")
);

-- CreateTable
CREATE TABLE "cabinet_cabinet_sizes" (
    "cabinet_code" TEXT NOT NULL,
    "size_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_cabinet_sizes_pkey" PRIMARY KEY ("cabinet_code","size_code")
);

-- CreateTable
CREATE TABLE "cabinet_pitches" (
    "cabinet_code" TEXT NOT NULL,
    "pitch_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_pitches_pkey" PRIMARY KEY ("cabinet_code","pitch_code")
);

-- CreateTable
CREATE TABLE "cabinet_manufacturers" (
    "cabinet_code" TEXT NOT NULL,
    "manufacturer_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_manufacturers_pkey" PRIMARY KEY ("cabinet_code","manufacturer_code")
);

-- CreateTable
CREATE TABLE "cabinet_suppliers" (
    "cabinet_code" TEXT NOT NULL,
    "supplier_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_suppliers_pkey" PRIMARY KEY ("cabinet_code","supplier_code")
);

-- CreateTable
CREATE TABLE "cabinet_items_components" (
    "cabinet_code" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_count" INTEGER NOT NULL,

    CONSTRAINT "cabinet_items_components_pkey" PRIMARY KEY ("cabinet_code","item_code")
);

-- CreateTable
CREATE TABLE "cabinet_prices" (
    "cabinet_code" TEXT NOT NULL,
    "price_usd" DECIMAL(12,2),
    "price_rub" DECIMAL(12,2),

    CONSTRAINT "cabinet_prices_pkey" PRIMARY KEY ("cabinet_code")
);

-- CreateTable
CREATE TABLE "module_categories" (
    "module_code" TEXT NOT NULL,
    "item_category_code" TEXT NOT NULL,

    CONSTRAINT "module_categories_pkey" PRIMARY KEY ("module_code","item_category_code")
);

-- CreateTable
CREATE TABLE "module_subcategories" (
    "module_code" TEXT NOT NULL,
    "item_subcategory_code" TEXT NOT NULL,

    CONSTRAINT "module_subcategories_pkey" PRIMARY KEY ("module_code","item_subcategory_code")
);

-- CreateTable
CREATE TABLE "module_locations" (
    "module_code" TEXT NOT NULL,
    "location_code" TEXT NOT NULL,

    CONSTRAINT "module_locations_pkey" PRIMARY KEY ("module_code","location_code")
);

-- CreateTable
CREATE TABLE "module_refresh_rates" (
    "module_code" TEXT NOT NULL,
    "refresh_rate_code" TEXT NOT NULL,

    CONSTRAINT "module_refresh_rates_pkey" PRIMARY KEY ("module_code","refresh_rate_code")
);

-- CreateTable
CREATE TABLE "module_brightness_values" (
    "module_code" TEXT NOT NULL,
    "brightness_code" TEXT NOT NULL,

    CONSTRAINT "module_brightness_values_pkey" PRIMARY KEY ("module_code","brightness_code")
);

-- CreateTable
CREATE TABLE "module_module_sizes" (
    "module_code" TEXT NOT NULL,
    "module_size_code" TEXT NOT NULL,

    CONSTRAINT "module_module_sizes_pkey" PRIMARY KEY ("module_code","module_size_code")
);

-- CreateTable
CREATE TABLE "module_pitches" (
    "module_code" TEXT NOT NULL,
    "pitch_code" TEXT NOT NULL,

    CONSTRAINT "module_pitches_pkey" PRIMARY KEY ("module_code","pitch_code")
);

-- CreateTable
CREATE TABLE "module_manufacturers" (
    "module_code" TEXT NOT NULL,
    "manufacturer_code" TEXT NOT NULL,

    CONSTRAINT "module_manufacturers_pkey" PRIMARY KEY ("module_code","manufacturer_code")
);

-- CreateTable
CREATE TABLE "module_items_components" (
    "module_code" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_count" INTEGER NOT NULL,

    CONSTRAINT "module_items_components_pkey" PRIMARY KEY ("module_code","item_code")
);

-- CreateTable
CREATE TABLE "module_options" (
    "module_code" TEXT NOT NULL,
    "option_code" TEXT NOT NULL,

    CONSTRAINT "module_options_pkey" PRIMARY KEY ("module_code","option_code")
);

-- CreateTable
CREATE TABLE "module_prices" (
    "module_code" TEXT NOT NULL,
    "price_usd" DECIMAL(12,2),
    "price_rub" DECIMAL(12,2),

    CONSTRAINT "module_prices_pkey" PRIMARY KEY ("module_code")
);

-- CreateTable
CREATE TABLE "cabinet_size_module_sizes" (
    "cabinet_size_code" TEXT NOT NULL,
    "module_size_code" TEXT NOT NULL,

    CONSTRAINT "cabinet_size_module_sizes_pkey" PRIMARY KEY ("cabinet_size_code","module_size_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "screen_types_screen_type_code_key" ON "screen_types"("screen_type_code");

-- CreateIndex
CREATE UNIQUE INDEX "materials_material_code_key" ON "materials"("material_code");

-- CreateIndex
CREATE UNIQUE INDEX "locations_location_code_key" ON "locations"("location_code");

-- CreateIndex
CREATE UNIQUE INDEX "placements_placement_code_key" ON "placements"("placement_code");

-- CreateIndex
CREATE UNIQUE INDEX "options_option_code_key" ON "options"("option_code");

-- CreateIndex
CREATE UNIQUE INDEX "sensors_sensor_code_key" ON "sensors"("sensor_code");

-- CreateIndex
CREATE UNIQUE INDEX "control_types_control_type_code_key" ON "control_types"("control_type_code");

-- CreateIndex
CREATE UNIQUE INDEX "pitches_pitch_code_key" ON "pitches"("pitch_code");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_rates_refresh_rate_code_key" ON "refresh_rates"("refresh_rate_code");

-- CreateIndex
CREATE UNIQUE INDEX "brightness_values_brightness_code_key" ON "brightness_values"("brightness_code");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_manufacturer_code_key" ON "manufacturers"("manufacturer_code");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplier_code_key" ON "suppliers"("supplier_code");

-- CreateIndex
CREATE UNIQUE INDEX "ip_protection_ip_code_key" ON "ip_protection"("ip_code");

-- CreateIndex
CREATE UNIQUE INDEX "module_sizes_module_size_code_key" ON "module_sizes"("module_size_code");

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_sizes_cabinet_size_code_key" ON "cabinet_sizes"("cabinet_size_code");

-- CreateIndex
CREATE UNIQUE INDEX "item_categories_item_category_code_key" ON "item_categories"("item_category_code");

-- CreateIndex
CREATE UNIQUE INDEX "item_subcategories_item_subcategory_code_key" ON "item_subcategories"("item_subcategory_code");

-- CreateIndex
CREATE UNIQUE INDEX "cabinets_cabinet_code_key" ON "cabinets"("cabinet_code");

-- CreateIndex
CREATE UNIQUE INDEX "cabinets_cabinet_sku_key" ON "cabinets"("cabinet_sku");

-- CreateIndex
CREATE UNIQUE INDEX "modules_module_code_key" ON "modules"("module_code");

-- CreateIndex
CREATE UNIQUE INDEX "modules_module_sku_key" ON "modules"("module_sku");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_code_key" ON "items"("item_code");

-- AddForeignKey
ALTER TABLE "screen_type_options" ADD CONSTRAINT "screen_type_options_screen_type_code_fkey" FOREIGN KEY ("screen_type_code") REFERENCES "screen_types"("screen_type_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_options" ADD CONSTRAINT "screen_type_options_option_code_fkey" FOREIGN KEY ("option_code") REFERENCES "options"("option_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_control_types" ADD CONSTRAINT "screen_type_control_types_screen_type_code_fkey" FOREIGN KEY ("screen_type_code") REFERENCES "screen_types"("screen_type_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_control_types" ADD CONSTRAINT "screen_type_control_types_control_type_code_fkey" FOREIGN KEY ("control_type_code") REFERENCES "control_types"("control_type_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_sensors" ADD CONSTRAINT "screen_type_sensors_screen_type_code_fkey" FOREIGN KEY ("screen_type_code") REFERENCES "screen_types"("screen_type_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_type_sensors" ADD CONSTRAINT "screen_type_sensors_sensor_code_fkey" FOREIGN KEY ("sensor_code") REFERENCES "sensors"("sensor_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_categories_items" ADD CONSTRAINT "item_categories_items_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "items"("item_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_categories_items" ADD CONSTRAINT "item_categories_items_item_category_code_fkey" FOREIGN KEY ("item_category_code") REFERENCES "item_categories"("item_category_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_subcategories_items" ADD CONSTRAINT "item_subcategories_items_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "items"("item_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_subcategories_items" ADD CONSTRAINT "item_subcategories_items_item_subcategory_code_fkey" FOREIGN KEY ("item_subcategory_code") REFERENCES "item_subcategories"("item_subcategory_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_prices" ADD CONSTRAINT "item_prices_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "items"("item_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_suppliers" ADD CONSTRAINT "item_suppliers_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "items"("item_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_suppliers" ADD CONSTRAINT "item_suppliers_supplier_code_fkey" FOREIGN KEY ("supplier_code") REFERENCES "suppliers"("supplier_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_category_subcategories" ADD CONSTRAINT "item_category_subcategories_item_category_code_fkey" FOREIGN KEY ("item_category_code") REFERENCES "item_categories"("item_category_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_category_subcategories" ADD CONSTRAINT "item_category_subcategories_item_subcategory_code_fkey" FOREIGN KEY ("item_subcategory_code") REFERENCES "item_subcategories"("item_subcategory_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_categories" ADD CONSTRAINT "cabinet_categories_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_categories" ADD CONSTRAINT "cabinet_categories_item_category_code_fkey" FOREIGN KEY ("item_category_code") REFERENCES "item_categories"("item_category_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_subcategories" ADD CONSTRAINT "cabinet_subcategories_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_subcategories" ADD CONSTRAINT "cabinet_subcategories_item_subcategory_code_fkey" FOREIGN KEY ("item_subcategory_code") REFERENCES "item_subcategories"("item_subcategory_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_locations" ADD CONSTRAINT "cabinet_locations_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_locations" ADD CONSTRAINT "cabinet_locations_location_code_fkey" FOREIGN KEY ("location_code") REFERENCES "locations"("location_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_placements_cabinets" ADD CONSTRAINT "cabinet_placements_cabinets_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_placements_cabinets" ADD CONSTRAINT "cabinet_placements_cabinets_placement_code_fkey" FOREIGN KEY ("placement_code") REFERENCES "placements"("placement_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_materials" ADD CONSTRAINT "cabinet_materials_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_materials" ADD CONSTRAINT "cabinet_materials_material_code_fkey" FOREIGN KEY ("material_code") REFERENCES "materials"("material_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_cabinet_sizes" ADD CONSTRAINT "cabinet_cabinet_sizes_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_cabinet_sizes" ADD CONSTRAINT "cabinet_cabinet_sizes_size_code_fkey" FOREIGN KEY ("size_code") REFERENCES "cabinet_sizes"("cabinet_size_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_pitches" ADD CONSTRAINT "cabinet_pitches_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_pitches" ADD CONSTRAINT "cabinet_pitches_pitch_code_fkey" FOREIGN KEY ("pitch_code") REFERENCES "pitches"("pitch_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_manufacturers" ADD CONSTRAINT "cabinet_manufacturers_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_manufacturers" ADD CONSTRAINT "cabinet_manufacturers_manufacturer_code_fkey" FOREIGN KEY ("manufacturer_code") REFERENCES "manufacturers"("manufacturer_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_suppliers" ADD CONSTRAINT "cabinet_suppliers_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_suppliers" ADD CONSTRAINT "cabinet_suppliers_supplier_code_fkey" FOREIGN KEY ("supplier_code") REFERENCES "suppliers"("supplier_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_items_components" ADD CONSTRAINT "cabinet_items_components_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_items_components" ADD CONSTRAINT "cabinet_items_components_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "items"("item_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_prices" ADD CONSTRAINT "cabinet_prices_cabinet_code_fkey" FOREIGN KEY ("cabinet_code") REFERENCES "cabinets"("cabinet_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_categories" ADD CONSTRAINT "module_categories_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_categories" ADD CONSTRAINT "module_categories_item_category_code_fkey" FOREIGN KEY ("item_category_code") REFERENCES "item_categories"("item_category_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_subcategories" ADD CONSTRAINT "module_subcategories_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_subcategories" ADD CONSTRAINT "module_subcategories_item_subcategory_code_fkey" FOREIGN KEY ("item_subcategory_code") REFERENCES "item_subcategories"("item_subcategory_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_locations" ADD CONSTRAINT "module_locations_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_locations" ADD CONSTRAINT "module_locations_location_code_fkey" FOREIGN KEY ("location_code") REFERENCES "locations"("location_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_refresh_rates" ADD CONSTRAINT "module_refresh_rates_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_refresh_rates" ADD CONSTRAINT "module_refresh_rates_refresh_rate_code_fkey" FOREIGN KEY ("refresh_rate_code") REFERENCES "refresh_rates"("refresh_rate_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_brightness_values" ADD CONSTRAINT "module_brightness_values_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_brightness_values" ADD CONSTRAINT "module_brightness_values_brightness_code_fkey" FOREIGN KEY ("brightness_code") REFERENCES "brightness_values"("brightness_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_module_sizes" ADD CONSTRAINT "module_module_sizes_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_module_sizes" ADD CONSTRAINT "module_module_sizes_module_size_code_fkey" FOREIGN KEY ("module_size_code") REFERENCES "module_sizes"("module_size_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_pitches" ADD CONSTRAINT "module_pitches_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_pitches" ADD CONSTRAINT "module_pitches_pitch_code_fkey" FOREIGN KEY ("pitch_code") REFERENCES "pitches"("pitch_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_manufacturers" ADD CONSTRAINT "module_manufacturers_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_manufacturers" ADD CONSTRAINT "module_manufacturers_manufacturer_code_fkey" FOREIGN KEY ("manufacturer_code") REFERENCES "manufacturers"("manufacturer_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_items_components" ADD CONSTRAINT "module_items_components_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_items_components" ADD CONSTRAINT "module_items_components_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "items"("item_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_options" ADD CONSTRAINT "module_options_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_options" ADD CONSTRAINT "module_options_option_code_fkey" FOREIGN KEY ("option_code") REFERENCES "options"("option_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_prices" ADD CONSTRAINT "module_prices_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "modules"("module_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_size_module_sizes" ADD CONSTRAINT "cabinet_size_module_sizes_cabinet_size_code_fkey" FOREIGN KEY ("cabinet_size_code") REFERENCES "cabinet_sizes"("cabinet_size_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_size_module_sizes" ADD CONSTRAINT "cabinet_size_module_sizes_module_size_code_fkey" FOREIGN KEY ("module_size_code") REFERENCES "module_sizes"("module_size_code") ON DELETE CASCADE ON UPDATE CASCADE;
