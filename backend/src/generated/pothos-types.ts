/* eslint-disable */
import type { Prisma, User, ScreenType, Material, Location, Placement, Option, Sensor, ControlType, Pitch, RefreshRate, Brightness, Manufacturer, Supplier, IpProtection, ModuleSize, CabinetSize, ItemCategory, ItemSubcategory, Cabinet, Module, Item, ScreenTypeOption, ScreenTypeControlType, ScreenTypeSensor, ItemCategoryRelation, ItemSubcategoryRelation, ItemPrice, ItemSupplier, ItemCategorySubcategory, CabinetCategory, CabinetSubcategory, CabinetLocation, CabinetPlacement, CabinetMaterial, CabinetCabinetSize, CabinetPitch, CabinetManufacturer, CabinetSupplier, CabinetItemComponent, CabinetPrice, ModuleCategory, ModuleSubcategory, ModuleLocation, ModuleRefreshRate, ModuleBrightness, ModuleModuleSize, ModulePitch, ModuleManufacturer, ModuleItemComponent, ModuleOption, ModulePrice, CabinetSizeModuleSize } from "D:\\code\\ledts\\calculator\\backend\\prisma\\generated\\client/index.js";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: never;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    ScreenType: {
        Name: "ScreenType";
        Shape: ScreenType;
        Include: Prisma.ScreenTypeInclude;
        Select: Prisma.ScreenTypeSelect;
        OrderBy: Prisma.ScreenTypeOrderByWithRelationInput;
        WhereUnique: Prisma.ScreenTypeWhereUniqueInput;
        Where: Prisma.ScreenTypeWhereInput;
        Create: {};
        Update: {};
        RelationName: "options" | "controlTypes" | "sensors";
        ListRelations: "options" | "controlTypes" | "sensors";
        Relations: {
            options: {
                Shape: ScreenTypeOption[];
                Name: "ScreenTypeOption";
                Nullable: false;
            };
            controlTypes: {
                Shape: ScreenTypeControlType[];
                Name: "ScreenTypeControlType";
                Nullable: false;
            };
            sensors: {
                Shape: ScreenTypeSensor[];
                Name: "ScreenTypeSensor";
                Nullable: false;
            };
        };
    };
    Material: {
        Name: "Material";
        Shape: Material;
        Include: Prisma.MaterialInclude;
        Select: Prisma.MaterialSelect;
        OrderBy: Prisma.MaterialOrderByWithRelationInput;
        WhereUnique: Prisma.MaterialWhereUniqueInput;
        Where: Prisma.MaterialWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinets";
        ListRelations: "cabinets";
        Relations: {
            cabinets: {
                Shape: CabinetMaterial[];
                Name: "CabinetMaterial";
                Nullable: false;
            };
        };
    };
    Location: {
        Name: "Location";
        Shape: Location;
        Include: Prisma.LocationInclude;
        Select: Prisma.LocationSelect;
        OrderBy: Prisma.LocationOrderByWithRelationInput;
        WhereUnique: Prisma.LocationWhereUniqueInput;
        Where: Prisma.LocationWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinets" | "modules";
        ListRelations: "cabinets" | "modules";
        Relations: {
            cabinets: {
                Shape: CabinetLocation[];
                Name: "CabinetLocation";
                Nullable: false;
            };
            modules: {
                Shape: ModuleLocation[];
                Name: "ModuleLocation";
                Nullable: false;
            };
        };
    };
    Placement: {
        Name: "Placement";
        Shape: Placement;
        Include: Prisma.PlacementInclude;
        Select: Prisma.PlacementSelect;
        OrderBy: Prisma.PlacementOrderByWithRelationInput;
        WhereUnique: Prisma.PlacementWhereUniqueInput;
        Where: Prisma.PlacementWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinets";
        ListRelations: "cabinets";
        Relations: {
            cabinets: {
                Shape: CabinetPlacement[];
                Name: "CabinetPlacement";
                Nullable: false;
            };
        };
    };
    Option: {
        Name: "Option";
        Shape: Option;
        Include: Prisma.OptionInclude;
        Select: Prisma.OptionSelect;
        OrderBy: Prisma.OptionOrderByWithRelationInput;
        WhereUnique: Prisma.OptionWhereUniqueInput;
        Where: Prisma.OptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "screenTypes" | "modules";
        ListRelations: "screenTypes" | "modules";
        Relations: {
            screenTypes: {
                Shape: ScreenTypeOption[];
                Name: "ScreenTypeOption";
                Nullable: false;
            };
            modules: {
                Shape: ModuleOption[];
                Name: "ModuleOption";
                Nullable: false;
            };
        };
    };
    Sensor: {
        Name: "Sensor";
        Shape: Sensor;
        Include: Prisma.SensorInclude;
        Select: Prisma.SensorSelect;
        OrderBy: Prisma.SensorOrderByWithRelationInput;
        WhereUnique: Prisma.SensorWhereUniqueInput;
        Where: Prisma.SensorWhereInput;
        Create: {};
        Update: {};
        RelationName: "screenTypes";
        ListRelations: "screenTypes";
        Relations: {
            screenTypes: {
                Shape: ScreenTypeSensor[];
                Name: "ScreenTypeSensor";
                Nullable: false;
            };
        };
    };
    ControlType: {
        Name: "ControlType";
        Shape: ControlType;
        Include: Prisma.ControlTypeInclude;
        Select: Prisma.ControlTypeSelect;
        OrderBy: Prisma.ControlTypeOrderByWithRelationInput;
        WhereUnique: Prisma.ControlTypeWhereUniqueInput;
        Where: Prisma.ControlTypeWhereInput;
        Create: {};
        Update: {};
        RelationName: "screenTypes";
        ListRelations: "screenTypes";
        Relations: {
            screenTypes: {
                Shape: ScreenTypeControlType[];
                Name: "ScreenTypeControlType";
                Nullable: false;
            };
        };
    };
    Pitch: {
        Name: "Pitch";
        Shape: Pitch;
        Include: Prisma.PitchInclude;
        Select: Prisma.PitchSelect;
        OrderBy: Prisma.PitchOrderByWithRelationInput;
        WhereUnique: Prisma.PitchWhereUniqueInput;
        Where: Prisma.PitchWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinets" | "modules";
        ListRelations: "cabinets" | "modules";
        Relations: {
            cabinets: {
                Shape: CabinetPitch[];
                Name: "CabinetPitch";
                Nullable: false;
            };
            modules: {
                Shape: ModulePitch[];
                Name: "ModulePitch";
                Nullable: false;
            };
        };
    };
    RefreshRate: {
        Name: "RefreshRate";
        Shape: RefreshRate;
        Include: Prisma.RefreshRateInclude;
        Select: Prisma.RefreshRateSelect;
        OrderBy: Prisma.RefreshRateOrderByWithRelationInput;
        WhereUnique: Prisma.RefreshRateWhereUniqueInput;
        Where: Prisma.RefreshRateWhereInput;
        Create: {};
        Update: {};
        RelationName: "modules";
        ListRelations: "modules";
        Relations: {
            modules: {
                Shape: ModuleRefreshRate[];
                Name: "ModuleRefreshRate";
                Nullable: false;
            };
        };
    };
    Brightness: {
        Name: "Brightness";
        Shape: Brightness;
        Include: Prisma.BrightnessInclude;
        Select: Prisma.BrightnessSelect;
        OrderBy: Prisma.BrightnessOrderByWithRelationInput;
        WhereUnique: Prisma.BrightnessWhereUniqueInput;
        Where: Prisma.BrightnessWhereInput;
        Create: {};
        Update: {};
        RelationName: "modules";
        ListRelations: "modules";
        Relations: {
            modules: {
                Shape: ModuleBrightness[];
                Name: "ModuleBrightness";
                Nullable: false;
            };
        };
    };
    Manufacturer: {
        Name: "Manufacturer";
        Shape: Manufacturer;
        Include: Prisma.ManufacturerInclude;
        Select: Prisma.ManufacturerSelect;
        OrderBy: Prisma.ManufacturerOrderByWithRelationInput;
        WhereUnique: Prisma.ManufacturerWhereUniqueInput;
        Where: Prisma.ManufacturerWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinets" | "modules";
        ListRelations: "cabinets" | "modules";
        Relations: {
            cabinets: {
                Shape: CabinetManufacturer[];
                Name: "CabinetManufacturer";
                Nullable: false;
            };
            modules: {
                Shape: ModuleManufacturer[];
                Name: "ModuleManufacturer";
                Nullable: false;
            };
        };
    };
    Supplier: {
        Name: "Supplier";
        Shape: Supplier;
        Include: Prisma.SupplierInclude;
        Select: Prisma.SupplierSelect;
        OrderBy: Prisma.SupplierOrderByWithRelationInput;
        WhereUnique: Prisma.SupplierWhereUniqueInput;
        Where: Prisma.SupplierWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinets" | "items";
        ListRelations: "cabinets" | "items";
        Relations: {
            cabinets: {
                Shape: CabinetSupplier[];
                Name: "CabinetSupplier";
                Nullable: false;
            };
            items: {
                Shape: ItemSupplier[];
                Name: "ItemSupplier";
                Nullable: false;
            };
        };
    };
    IpProtection: {
        Name: "IpProtection";
        Shape: IpProtection;
        Include: never;
        Select: Prisma.IpProtectionSelect;
        OrderBy: Prisma.IpProtectionOrderByWithRelationInput;
        WhereUnique: Prisma.IpProtectionWhereUniqueInput;
        Where: Prisma.IpProtectionWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    ModuleSize: {
        Name: "ModuleSize";
        Shape: ModuleSize;
        Include: Prisma.ModuleSizeInclude;
        Select: Prisma.ModuleSizeSelect;
        OrderBy: Prisma.ModuleSizeOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleSizeWhereUniqueInput;
        Where: Prisma.ModuleSizeWhereInput;
        Create: {};
        Update: {};
        RelationName: "modules" | "cabinetSizes";
        ListRelations: "modules" | "cabinetSizes";
        Relations: {
            modules: {
                Shape: ModuleModuleSize[];
                Name: "ModuleModuleSize";
                Nullable: false;
            };
            cabinetSizes: {
                Shape: CabinetSizeModuleSize[];
                Name: "CabinetSizeModuleSize";
                Nullable: false;
            };
        };
    };
    CabinetSize: {
        Name: "CabinetSize";
        Shape: CabinetSize;
        Include: Prisma.CabinetSizeInclude;
        Select: Prisma.CabinetSizeSelect;
        OrderBy: Prisma.CabinetSizeOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetSizeWhereUniqueInput;
        Where: Prisma.CabinetSizeWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinets" | "moduleSizes";
        ListRelations: "cabinets" | "moduleSizes";
        Relations: {
            cabinets: {
                Shape: CabinetCabinetSize[];
                Name: "CabinetCabinetSize";
                Nullable: false;
            };
            moduleSizes: {
                Shape: CabinetSizeModuleSize[];
                Name: "CabinetSizeModuleSize";
                Nullable: false;
            };
        };
    };
    ItemCategory: {
        Name: "ItemCategory";
        Shape: ItemCategory;
        Include: Prisma.ItemCategoryInclude;
        Select: Prisma.ItemCategorySelect;
        OrderBy: Prisma.ItemCategoryOrderByWithRelationInput;
        WhereUnique: Prisma.ItemCategoryWhereUniqueInput;
        Where: Prisma.ItemCategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "subcategories" | "items" | "cabinets" | "modules";
        ListRelations: "subcategories" | "items" | "cabinets" | "modules";
        Relations: {
            subcategories: {
                Shape: ItemCategorySubcategory[];
                Name: "ItemCategorySubcategory";
                Nullable: false;
            };
            items: {
                Shape: ItemCategoryRelation[];
                Name: "ItemCategoryRelation";
                Nullable: false;
            };
            cabinets: {
                Shape: CabinetCategory[];
                Name: "CabinetCategory";
                Nullable: false;
            };
            modules: {
                Shape: ModuleCategory[];
                Name: "ModuleCategory";
                Nullable: false;
            };
        };
    };
    ItemSubcategory: {
        Name: "ItemSubcategory";
        Shape: ItemSubcategory;
        Include: Prisma.ItemSubcategoryInclude;
        Select: Prisma.ItemSubcategorySelect;
        OrderBy: Prisma.ItemSubcategoryOrderByWithRelationInput;
        WhereUnique: Prisma.ItemSubcategoryWhereUniqueInput;
        Where: Prisma.ItemSubcategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "categories" | "items" | "cabinets" | "modules";
        ListRelations: "categories" | "items" | "cabinets" | "modules";
        Relations: {
            categories: {
                Shape: ItemCategorySubcategory[];
                Name: "ItemCategorySubcategory";
                Nullable: false;
            };
            items: {
                Shape: ItemSubcategoryRelation[];
                Name: "ItemSubcategoryRelation";
                Nullable: false;
            };
            cabinets: {
                Shape: CabinetSubcategory[];
                Name: "CabinetSubcategory";
                Nullable: false;
            };
            modules: {
                Shape: ModuleSubcategory[];
                Name: "ModuleSubcategory";
                Nullable: false;
            };
        };
    };
    Cabinet: {
        Name: "Cabinet";
        Shape: Cabinet;
        Include: Prisma.CabinetInclude;
        Select: Prisma.CabinetSelect;
        OrderBy: Prisma.CabinetOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetWhereUniqueInput;
        Where: Prisma.CabinetWhereInput;
        Create: {};
        Update: {};
        RelationName: "categories" | "subcategories" | "locations" | "placements" | "materials" | "sizes" | "pitches" | "manufacturers" | "suppliers" | "items" | "prices";
        ListRelations: "categories" | "subcategories" | "locations" | "placements" | "materials" | "sizes" | "pitches" | "manufacturers" | "suppliers" | "items" | "prices";
        Relations: {
            categories: {
                Shape: CabinetCategory[];
                Name: "CabinetCategory";
                Nullable: false;
            };
            subcategories: {
                Shape: CabinetSubcategory[];
                Name: "CabinetSubcategory";
                Nullable: false;
            };
            locations: {
                Shape: CabinetLocation[];
                Name: "CabinetLocation";
                Nullable: false;
            };
            placements: {
                Shape: CabinetPlacement[];
                Name: "CabinetPlacement";
                Nullable: false;
            };
            materials: {
                Shape: CabinetMaterial[];
                Name: "CabinetMaterial";
                Nullable: false;
            };
            sizes: {
                Shape: CabinetCabinetSize[];
                Name: "CabinetCabinetSize";
                Nullable: false;
            };
            pitches: {
                Shape: CabinetPitch[];
                Name: "CabinetPitch";
                Nullable: false;
            };
            manufacturers: {
                Shape: CabinetManufacturer[];
                Name: "CabinetManufacturer";
                Nullable: false;
            };
            suppliers: {
                Shape: CabinetSupplier[];
                Name: "CabinetSupplier";
                Nullable: false;
            };
            items: {
                Shape: CabinetItemComponent[];
                Name: "CabinetItemComponent";
                Nullable: false;
            };
            prices: {
                Shape: CabinetPrice[];
                Name: "CabinetPrice";
                Nullable: false;
            };
        };
    };
    Module: {
        Name: "Module";
        Shape: Module;
        Include: Prisma.ModuleInclude;
        Select: Prisma.ModuleSelect;
        OrderBy: Prisma.ModuleOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleWhereUniqueInput;
        Where: Prisma.ModuleWhereInput;
        Create: {};
        Update: {};
        RelationName: "categories" | "subcategories" | "locations" | "refreshRates" | "brightnesses" | "sizes" | "pitches" | "manufacturers" | "items" | "options" | "prices";
        ListRelations: "categories" | "subcategories" | "locations" | "refreshRates" | "brightnesses" | "sizes" | "pitches" | "manufacturers" | "items" | "options" | "prices";
        Relations: {
            categories: {
                Shape: ModuleCategory[];
                Name: "ModuleCategory";
                Nullable: false;
            };
            subcategories: {
                Shape: ModuleSubcategory[];
                Name: "ModuleSubcategory";
                Nullable: false;
            };
            locations: {
                Shape: ModuleLocation[];
                Name: "ModuleLocation";
                Nullable: false;
            };
            refreshRates: {
                Shape: ModuleRefreshRate[];
                Name: "ModuleRefreshRate";
                Nullable: false;
            };
            brightnesses: {
                Shape: ModuleBrightness[];
                Name: "ModuleBrightness";
                Nullable: false;
            };
            sizes: {
                Shape: ModuleModuleSize[];
                Name: "ModuleModuleSize";
                Nullable: false;
            };
            pitches: {
                Shape: ModulePitch[];
                Name: "ModulePitch";
                Nullable: false;
            };
            manufacturers: {
                Shape: ModuleManufacturer[];
                Name: "ModuleManufacturer";
                Nullable: false;
            };
            items: {
                Shape: ModuleItemComponent[];
                Name: "ModuleItemComponent";
                Nullable: false;
            };
            options: {
                Shape: ModuleOption[];
                Name: "ModuleOption";
                Nullable: false;
            };
            prices: {
                Shape: ModulePrice[];
                Name: "ModulePrice";
                Nullable: false;
            };
        };
    };
    Item: {
        Name: "Item";
        Shape: Item;
        Include: Prisma.ItemInclude;
        Select: Prisma.ItemSelect;
        OrderBy: Prisma.ItemOrderByWithRelationInput;
        WhereUnique: Prisma.ItemWhereUniqueInput;
        Where: Prisma.ItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "categories" | "subcategories" | "prices" | "suppliers" | "cabinets" | "modules";
        ListRelations: "categories" | "subcategories" | "prices" | "suppliers" | "cabinets" | "modules";
        Relations: {
            categories: {
                Shape: ItemCategoryRelation[];
                Name: "ItemCategoryRelation";
                Nullable: false;
            };
            subcategories: {
                Shape: ItemSubcategoryRelation[];
                Name: "ItemSubcategoryRelation";
                Nullable: false;
            };
            prices: {
                Shape: ItemPrice[];
                Name: "ItemPrice";
                Nullable: false;
            };
            suppliers: {
                Shape: ItemSupplier[];
                Name: "ItemSupplier";
                Nullable: false;
            };
            cabinets: {
                Shape: CabinetItemComponent[];
                Name: "CabinetItemComponent";
                Nullable: false;
            };
            modules: {
                Shape: ModuleItemComponent[];
                Name: "ModuleItemComponent";
                Nullable: false;
            };
        };
    };
    ScreenTypeOption: {
        Name: "ScreenTypeOption";
        Shape: ScreenTypeOption;
        Include: Prisma.ScreenTypeOptionInclude;
        Select: Prisma.ScreenTypeOptionSelect;
        OrderBy: Prisma.ScreenTypeOptionOrderByWithRelationInput;
        WhereUnique: Prisma.ScreenTypeOptionWhereUniqueInput;
        Where: Prisma.ScreenTypeOptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "screenType" | "option";
        ListRelations: never;
        Relations: {
            screenType: {
                Shape: ScreenType;
                Name: "ScreenType";
                Nullable: false;
            };
            option: {
                Shape: Option;
                Name: "Option";
                Nullable: false;
            };
        };
    };
    ScreenTypeControlType: {
        Name: "ScreenTypeControlType";
        Shape: ScreenTypeControlType;
        Include: Prisma.ScreenTypeControlTypeInclude;
        Select: Prisma.ScreenTypeControlTypeSelect;
        OrderBy: Prisma.ScreenTypeControlTypeOrderByWithRelationInput;
        WhereUnique: Prisma.ScreenTypeControlTypeWhereUniqueInput;
        Where: Prisma.ScreenTypeControlTypeWhereInput;
        Create: {};
        Update: {};
        RelationName: "screenType" | "controlType";
        ListRelations: never;
        Relations: {
            screenType: {
                Shape: ScreenType;
                Name: "ScreenType";
                Nullable: false;
            };
            controlType: {
                Shape: ControlType;
                Name: "ControlType";
                Nullable: false;
            };
        };
    };
    ScreenTypeSensor: {
        Name: "ScreenTypeSensor";
        Shape: ScreenTypeSensor;
        Include: Prisma.ScreenTypeSensorInclude;
        Select: Prisma.ScreenTypeSensorSelect;
        OrderBy: Prisma.ScreenTypeSensorOrderByWithRelationInput;
        WhereUnique: Prisma.ScreenTypeSensorWhereUniqueInput;
        Where: Prisma.ScreenTypeSensorWhereInput;
        Create: {};
        Update: {};
        RelationName: "screenType" | "sensor";
        ListRelations: never;
        Relations: {
            screenType: {
                Shape: ScreenType;
                Name: "ScreenType";
                Nullable: false;
            };
            sensor: {
                Shape: Sensor;
                Name: "Sensor";
                Nullable: false;
            };
        };
    };
    ItemCategoryRelation: {
        Name: "ItemCategoryRelation";
        Shape: ItemCategoryRelation;
        Include: Prisma.ItemCategoryRelationInclude;
        Select: Prisma.ItemCategoryRelationSelect;
        OrderBy: Prisma.ItemCategoryRelationOrderByWithRelationInput;
        WhereUnique: Prisma.ItemCategoryRelationWhereUniqueInput;
        Where: Prisma.ItemCategoryRelationWhereInput;
        Create: {};
        Update: {};
        RelationName: "item" | "category";
        ListRelations: never;
        Relations: {
            item: {
                Shape: Item;
                Name: "Item";
                Nullable: false;
            };
            category: {
                Shape: ItemCategory;
                Name: "ItemCategory";
                Nullable: false;
            };
        };
    };
    ItemSubcategoryRelation: {
        Name: "ItemSubcategoryRelation";
        Shape: ItemSubcategoryRelation;
        Include: Prisma.ItemSubcategoryRelationInclude;
        Select: Prisma.ItemSubcategoryRelationSelect;
        OrderBy: Prisma.ItemSubcategoryRelationOrderByWithRelationInput;
        WhereUnique: Prisma.ItemSubcategoryRelationWhereUniqueInput;
        Where: Prisma.ItemSubcategoryRelationWhereInput;
        Create: {};
        Update: {};
        RelationName: "item" | "subcategory";
        ListRelations: never;
        Relations: {
            item: {
                Shape: Item;
                Name: "Item";
                Nullable: false;
            };
            subcategory: {
                Shape: ItemSubcategory;
                Name: "ItemSubcategory";
                Nullable: false;
            };
        };
    };
    ItemPrice: {
        Name: "ItemPrice";
        Shape: ItemPrice;
        Include: Prisma.ItemPriceInclude;
        Select: Prisma.ItemPriceSelect;
        OrderBy: Prisma.ItemPriceOrderByWithRelationInput;
        WhereUnique: Prisma.ItemPriceWhereUniqueInput;
        Where: Prisma.ItemPriceWhereInput;
        Create: {};
        Update: {};
        RelationName: "item";
        ListRelations: never;
        Relations: {
            item: {
                Shape: Item;
                Name: "Item";
                Nullable: false;
            };
        };
    };
    ItemSupplier: {
        Name: "ItemSupplier";
        Shape: ItemSupplier;
        Include: Prisma.ItemSupplierInclude;
        Select: Prisma.ItemSupplierSelect;
        OrderBy: Prisma.ItemSupplierOrderByWithRelationInput;
        WhereUnique: Prisma.ItemSupplierWhereUniqueInput;
        Where: Prisma.ItemSupplierWhereInput;
        Create: {};
        Update: {};
        RelationName: "item" | "supplier";
        ListRelations: never;
        Relations: {
            item: {
                Shape: Item;
                Name: "Item";
                Nullable: false;
            };
            supplier: {
                Shape: Supplier;
                Name: "Supplier";
                Nullable: false;
            };
        };
    };
    ItemCategorySubcategory: {
        Name: "ItemCategorySubcategory";
        Shape: ItemCategorySubcategory;
        Include: Prisma.ItemCategorySubcategoryInclude;
        Select: Prisma.ItemCategorySubcategorySelect;
        OrderBy: Prisma.ItemCategorySubcategoryOrderByWithRelationInput;
        WhereUnique: Prisma.ItemCategorySubcategoryWhereUniqueInput;
        Where: Prisma.ItemCategorySubcategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "category" | "subcategory";
        ListRelations: never;
        Relations: {
            category: {
                Shape: ItemCategory;
                Name: "ItemCategory";
                Nullable: false;
            };
            subcategory: {
                Shape: ItemSubcategory;
                Name: "ItemSubcategory";
                Nullable: false;
            };
        };
    };
    CabinetCategory: {
        Name: "CabinetCategory";
        Shape: CabinetCategory;
        Include: Prisma.CabinetCategoryInclude;
        Select: Prisma.CabinetCategorySelect;
        OrderBy: Prisma.CabinetCategoryOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetCategoryWhereUniqueInput;
        Where: Prisma.CabinetCategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "category";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            category: {
                Shape: ItemCategory;
                Name: "ItemCategory";
                Nullable: false;
            };
        };
    };
    CabinetSubcategory: {
        Name: "CabinetSubcategory";
        Shape: CabinetSubcategory;
        Include: Prisma.CabinetSubcategoryInclude;
        Select: Prisma.CabinetSubcategorySelect;
        OrderBy: Prisma.CabinetSubcategoryOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetSubcategoryWhereUniqueInput;
        Where: Prisma.CabinetSubcategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "subcategory";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            subcategory: {
                Shape: ItemSubcategory;
                Name: "ItemSubcategory";
                Nullable: false;
            };
        };
    };
    CabinetLocation: {
        Name: "CabinetLocation";
        Shape: CabinetLocation;
        Include: Prisma.CabinetLocationInclude;
        Select: Prisma.CabinetLocationSelect;
        OrderBy: Prisma.CabinetLocationOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetLocationWhereUniqueInput;
        Where: Prisma.CabinetLocationWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "location";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            location: {
                Shape: Location;
                Name: "Location";
                Nullable: false;
            };
        };
    };
    CabinetPlacement: {
        Name: "CabinetPlacement";
        Shape: CabinetPlacement;
        Include: Prisma.CabinetPlacementInclude;
        Select: Prisma.CabinetPlacementSelect;
        OrderBy: Prisma.CabinetPlacementOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetPlacementWhereUniqueInput;
        Where: Prisma.CabinetPlacementWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "placement";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            placement: {
                Shape: Placement;
                Name: "Placement";
                Nullable: false;
            };
        };
    };
    CabinetMaterial: {
        Name: "CabinetMaterial";
        Shape: CabinetMaterial;
        Include: Prisma.CabinetMaterialInclude;
        Select: Prisma.CabinetMaterialSelect;
        OrderBy: Prisma.CabinetMaterialOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetMaterialWhereUniqueInput;
        Where: Prisma.CabinetMaterialWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "material";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            material: {
                Shape: Material;
                Name: "Material";
                Nullable: false;
            };
        };
    };
    CabinetCabinetSize: {
        Name: "CabinetCabinetSize";
        Shape: CabinetCabinetSize;
        Include: Prisma.CabinetCabinetSizeInclude;
        Select: Prisma.CabinetCabinetSizeSelect;
        OrderBy: Prisma.CabinetCabinetSizeOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetCabinetSizeWhereUniqueInput;
        Where: Prisma.CabinetCabinetSizeWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "size";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            size: {
                Shape: CabinetSize;
                Name: "CabinetSize";
                Nullable: false;
            };
        };
    };
    CabinetPitch: {
        Name: "CabinetPitch";
        Shape: CabinetPitch;
        Include: Prisma.CabinetPitchInclude;
        Select: Prisma.CabinetPitchSelect;
        OrderBy: Prisma.CabinetPitchOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetPitchWhereUniqueInput;
        Where: Prisma.CabinetPitchWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "pitch";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            pitch: {
                Shape: Pitch;
                Name: "Pitch";
                Nullable: false;
            };
        };
    };
    CabinetManufacturer: {
        Name: "CabinetManufacturer";
        Shape: CabinetManufacturer;
        Include: Prisma.CabinetManufacturerInclude;
        Select: Prisma.CabinetManufacturerSelect;
        OrderBy: Prisma.CabinetManufacturerOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetManufacturerWhereUniqueInput;
        Where: Prisma.CabinetManufacturerWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "manufacturer";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            manufacturer: {
                Shape: Manufacturer;
                Name: "Manufacturer";
                Nullable: false;
            };
        };
    };
    CabinetSupplier: {
        Name: "CabinetSupplier";
        Shape: CabinetSupplier;
        Include: Prisma.CabinetSupplierInclude;
        Select: Prisma.CabinetSupplierSelect;
        OrderBy: Prisma.CabinetSupplierOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetSupplierWhereUniqueInput;
        Where: Prisma.CabinetSupplierWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "supplier";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            supplier: {
                Shape: Supplier;
                Name: "Supplier";
                Nullable: false;
            };
        };
    };
    CabinetItemComponent: {
        Name: "CabinetItemComponent";
        Shape: CabinetItemComponent;
        Include: Prisma.CabinetItemComponentInclude;
        Select: Prisma.CabinetItemComponentSelect;
        OrderBy: Prisma.CabinetItemComponentOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetItemComponentWhereUniqueInput;
        Where: Prisma.CabinetItemComponentWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet" | "item";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
            item: {
                Shape: Item;
                Name: "Item";
                Nullable: false;
            };
        };
    };
    CabinetPrice: {
        Name: "CabinetPrice";
        Shape: CabinetPrice;
        Include: Prisma.CabinetPriceInclude;
        Select: Prisma.CabinetPriceSelect;
        OrderBy: Prisma.CabinetPriceOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetPriceWhereUniqueInput;
        Where: Prisma.CabinetPriceWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinet";
        ListRelations: never;
        Relations: {
            cabinet: {
                Shape: Cabinet;
                Name: "Cabinet";
                Nullable: false;
            };
        };
    };
    ModuleCategory: {
        Name: "ModuleCategory";
        Shape: ModuleCategory;
        Include: Prisma.ModuleCategoryInclude;
        Select: Prisma.ModuleCategorySelect;
        OrderBy: Prisma.ModuleCategoryOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleCategoryWhereUniqueInput;
        Where: Prisma.ModuleCategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "category";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            category: {
                Shape: ItemCategory;
                Name: "ItemCategory";
                Nullable: false;
            };
        };
    };
    ModuleSubcategory: {
        Name: "ModuleSubcategory";
        Shape: ModuleSubcategory;
        Include: Prisma.ModuleSubcategoryInclude;
        Select: Prisma.ModuleSubcategorySelect;
        OrderBy: Prisma.ModuleSubcategoryOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleSubcategoryWhereUniqueInput;
        Where: Prisma.ModuleSubcategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "subcategory";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            subcategory: {
                Shape: ItemSubcategory;
                Name: "ItemSubcategory";
                Nullable: false;
            };
        };
    };
    ModuleLocation: {
        Name: "ModuleLocation";
        Shape: ModuleLocation;
        Include: Prisma.ModuleLocationInclude;
        Select: Prisma.ModuleLocationSelect;
        OrderBy: Prisma.ModuleLocationOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleLocationWhereUniqueInput;
        Where: Prisma.ModuleLocationWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "location";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            location: {
                Shape: Location;
                Name: "Location";
                Nullable: false;
            };
        };
    };
    ModuleRefreshRate: {
        Name: "ModuleRefreshRate";
        Shape: ModuleRefreshRate;
        Include: Prisma.ModuleRefreshRateInclude;
        Select: Prisma.ModuleRefreshRateSelect;
        OrderBy: Prisma.ModuleRefreshRateOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleRefreshRateWhereUniqueInput;
        Where: Prisma.ModuleRefreshRateWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "refreshRate";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            refreshRate: {
                Shape: RefreshRate;
                Name: "RefreshRate";
                Nullable: false;
            };
        };
    };
    ModuleBrightness: {
        Name: "ModuleBrightness";
        Shape: ModuleBrightness;
        Include: Prisma.ModuleBrightnessInclude;
        Select: Prisma.ModuleBrightnessSelect;
        OrderBy: Prisma.ModuleBrightnessOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleBrightnessWhereUniqueInput;
        Where: Prisma.ModuleBrightnessWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "brightness";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            brightness: {
                Shape: Brightness;
                Name: "Brightness";
                Nullable: false;
            };
        };
    };
    ModuleModuleSize: {
        Name: "ModuleModuleSize";
        Shape: ModuleModuleSize;
        Include: Prisma.ModuleModuleSizeInclude;
        Select: Prisma.ModuleModuleSizeSelect;
        OrderBy: Prisma.ModuleModuleSizeOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleModuleSizeWhereUniqueInput;
        Where: Prisma.ModuleModuleSizeWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "size";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            size: {
                Shape: ModuleSize;
                Name: "ModuleSize";
                Nullable: false;
            };
        };
    };
    ModulePitch: {
        Name: "ModulePitch";
        Shape: ModulePitch;
        Include: Prisma.ModulePitchInclude;
        Select: Prisma.ModulePitchSelect;
        OrderBy: Prisma.ModulePitchOrderByWithRelationInput;
        WhereUnique: Prisma.ModulePitchWhereUniqueInput;
        Where: Prisma.ModulePitchWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "pitch";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            pitch: {
                Shape: Pitch;
                Name: "Pitch";
                Nullable: false;
            };
        };
    };
    ModuleManufacturer: {
        Name: "ModuleManufacturer";
        Shape: ModuleManufacturer;
        Include: Prisma.ModuleManufacturerInclude;
        Select: Prisma.ModuleManufacturerSelect;
        OrderBy: Prisma.ModuleManufacturerOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleManufacturerWhereUniqueInput;
        Where: Prisma.ModuleManufacturerWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "manufacturer";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            manufacturer: {
                Shape: Manufacturer;
                Name: "Manufacturer";
                Nullable: false;
            };
        };
    };
    ModuleItemComponent: {
        Name: "ModuleItemComponent";
        Shape: ModuleItemComponent;
        Include: Prisma.ModuleItemComponentInclude;
        Select: Prisma.ModuleItemComponentSelect;
        OrderBy: Prisma.ModuleItemComponentOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleItemComponentWhereUniqueInput;
        Where: Prisma.ModuleItemComponentWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "item";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            item: {
                Shape: Item;
                Name: "Item";
                Nullable: false;
            };
        };
    };
    ModuleOption: {
        Name: "ModuleOption";
        Shape: ModuleOption;
        Include: Prisma.ModuleOptionInclude;
        Select: Prisma.ModuleOptionSelect;
        OrderBy: Prisma.ModuleOptionOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleOptionWhereUniqueInput;
        Where: Prisma.ModuleOptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "module" | "option";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
            option: {
                Shape: Option;
                Name: "Option";
                Nullable: false;
            };
        };
    };
    ModulePrice: {
        Name: "ModulePrice";
        Shape: ModulePrice;
        Include: Prisma.ModulePriceInclude;
        Select: Prisma.ModulePriceSelect;
        OrderBy: Prisma.ModulePriceOrderByWithRelationInput;
        WhereUnique: Prisma.ModulePriceWhereUniqueInput;
        Where: Prisma.ModulePriceWhereInput;
        Create: {};
        Update: {};
        RelationName: "module";
        ListRelations: never;
        Relations: {
            module: {
                Shape: Module;
                Name: "Module";
                Nullable: false;
            };
        };
    };
    CabinetSizeModuleSize: {
        Name: "CabinetSizeModuleSize";
        Shape: CabinetSizeModuleSize;
        Include: Prisma.CabinetSizeModuleSizeInclude;
        Select: Prisma.CabinetSizeModuleSizeSelect;
        OrderBy: Prisma.CabinetSizeModuleSizeOrderByWithRelationInput;
        WhereUnique: Prisma.CabinetSizeModuleSizeWhereUniqueInput;
        Where: Prisma.CabinetSizeModuleSizeWhereInput;
        Create: {};
        Update: {};
        RelationName: "cabinetSize" | "moduleSize";
        ListRelations: never;
        Relations: {
            cabinetSize: {
                Shape: CabinetSize;
                Name: "CabinetSize";
                Nullable: false;
            };
            moduleSize: {
                Shape: ModuleSize;
                Name: "ModuleSize";
                Nullable: false;
            };
        };
    };
}