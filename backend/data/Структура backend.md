CALCULATOR
└── backend
    ├── data
    ├── node_modules
    ├── prisma
    │   ├── migrations
    │   └── seed
    │       ├── clearDatabase.ts
    │       ├── config.ts
    │       ├── index.ts
    │       ├── info.md
    │       ├── seedEntities.ts
    │       ├── seedRelations.ts
    │       └── utils.ts
    │   └── schema.prisma
    ├── src
        ├── config
        │   └── passport.ts
        ├── generated
        │   ├── pothos-types.ts
        ├── graphql
        │   ├── mutations
        │   │   └── authMutations.ts
        │   ├── queries
        │   │   ├── cabinetQueries.ts
        │   │   ├── itemQueries.ts
        │   │   ├── locationQueries.ts
        │   │   └── moduleQueries.ts
        │   └── types
        │       ├── Brightness.ts
        │       ├── CabinetItemComponent.ts
        │       ├── CabinetSize.ts
        │       ├── ControlType.ts
        │       ├── IpProtection.ts
        │       ├── Item.ts
        │       ├── ItemCategory.ts
        │       ├── ItemSubcategory.ts
        │       ├── Location.ts
        │       ├── Manufacturer.ts
        │       ├── Material.ts
        │       ├── Module.ts
        │       ├── ModuleSize.ts
        │       ├── Option.ts
        │       ├── Pitch.ts
        │       ├── Placement.ts
        │       ├── RefreshRate.ts
        │       ├── ScreenType.ts
        │       ├── Sensor.ts
        │       ├── Supplier.ts
        │       └── User.ts
        ├── builder.ts
        ├── schema.ts
        └── lib
            └── prisma.ts