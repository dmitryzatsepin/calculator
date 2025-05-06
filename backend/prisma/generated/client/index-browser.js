
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  role: 'role',
  createdAt: 'createdAt',
  name: 'name'
};

exports.Prisma.ScreenTypeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MaterialScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlacementScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OptionScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SensorScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ControlTypeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PitchScalarFieldEnum = {
  id: 'id',
  code: 'code',
  pitchValue: 'pitchValue',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RefreshRateScalarFieldEnum = {
  id: 'id',
  code: 'code',
  value: 'value',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BrightnessScalarFieldEnum = {
  id: 'id',
  code: 'code',
  value: 'value',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ManufacturerScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SupplierScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IpProtectionScalarFieldEnum = {
  id: 'id',
  code: 'code',
  protectionSolid: 'protectionSolid',
  protectionWater: 'protectionWater',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModuleSizeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  size: 'size',
  width: 'width',
  height: 'height',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CabinetSizeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  size: 'size',
  width: 'width',
  height: 'height',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemCategoryScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemSubcategoryScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CabinetScalarFieldEnum = {
  id: 'id',
  code: 'code',
  sku: 'sku',
  name: 'name',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModuleScalarFieldEnum = {
  id: 'id',
  code: 'code',
  sku: 'sku',
  name: 'name',
  moduleOption: 'moduleOption',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemScalarFieldEnum = {
  id: 'id',
  code: 'code',
  sku: 'sku',
  name: 'name',
  active: 'active',
  comment: 'comment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScreenTypeOptionScalarFieldEnum = {
  screenTypeCode: 'screenTypeCode',
  optionCode: 'optionCode'
};

exports.Prisma.ScreenTypeControlTypeScalarFieldEnum = {
  screenTypeCode: 'screenTypeCode',
  controlTypeCode: 'controlTypeCode'
};

exports.Prisma.ScreenTypeSensorScalarFieldEnum = {
  screenTypeCode: 'screenTypeCode',
  sensorCode: 'sensorCode'
};

exports.Prisma.ItemCategoryRelationScalarFieldEnum = {
  itemCode: 'itemCode',
  categoryCode: 'categoryCode'
};

exports.Prisma.ItemSubcategoryRelationScalarFieldEnum = {
  itemCode: 'itemCode',
  subcategoryCode: 'subcategoryCode'
};

exports.Prisma.ItemPriceScalarFieldEnum = {
  itemCode: 'itemCode',
  priceUsd: 'priceUsd',
  priceRub: 'priceRub'
};

exports.Prisma.ItemSupplierScalarFieldEnum = {
  itemCode: 'itemCode',
  supplierCode: 'supplierCode'
};

exports.Prisma.ItemCategorySubcategoryScalarFieldEnum = {
  categoryCode: 'categoryCode',
  subcategoryCode: 'subcategoryCode'
};

exports.Prisma.CabinetCategoryScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  categoryCode: 'categoryCode'
};

exports.Prisma.CabinetSubcategoryScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  subcategoryCode: 'subcategoryCode'
};

exports.Prisma.CabinetLocationScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  locationCode: 'locationCode'
};

exports.Prisma.CabinetPlacementScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  placementCode: 'placementCode'
};

exports.Prisma.CabinetMaterialScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  materialCode: 'materialCode'
};

exports.Prisma.CabinetCabinetSizeScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  cabinetSizeCode: 'cabinetSizeCode'
};

exports.Prisma.CabinetPitchScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  pitchCode: 'pitchCode'
};

exports.Prisma.CabinetManufacturerScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  manufacturerCode: 'manufacturerCode'
};

exports.Prisma.CabinetSupplierScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  supplierCode: 'supplierCode'
};

exports.Prisma.CabinetItemComponentScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  itemCode: 'itemCode',
  quantity: 'quantity'
};

exports.Prisma.CabinetPriceScalarFieldEnum = {
  cabinetCode: 'cabinetCode',
  priceUsd: 'priceUsd',
  priceRub: 'priceRub'
};

exports.Prisma.ModuleCategoryScalarFieldEnum = {
  moduleCode: 'moduleCode',
  categoryCode: 'categoryCode'
};

exports.Prisma.ModuleSubcategoryScalarFieldEnum = {
  moduleCode: 'moduleCode',
  subcategoryCode: 'subcategoryCode'
};

exports.Prisma.ModuleLocationScalarFieldEnum = {
  moduleCode: 'moduleCode',
  locationCode: 'locationCode'
};

exports.Prisma.ModuleRefreshRateScalarFieldEnum = {
  moduleCode: 'moduleCode',
  refreshRateCode: 'refreshRateCode'
};

exports.Prisma.ModuleBrightnessScalarFieldEnum = {
  moduleCode: 'moduleCode',
  brightnessCode: 'brightnessCode'
};

exports.Prisma.ModuleModuleSizeScalarFieldEnum = {
  moduleCode: 'moduleCode',
  moduleSizeCode: 'moduleSizeCode'
};

exports.Prisma.ModulePitchScalarFieldEnum = {
  moduleCode: 'moduleCode',
  pitchCode: 'pitchCode'
};

exports.Prisma.ModuleManufacturerScalarFieldEnum = {
  moduleCode: 'moduleCode',
  manufacturerCode: 'manufacturerCode'
};

exports.Prisma.ModuleItemComponentScalarFieldEnum = {
  moduleCode: 'moduleCode',
  itemCode: 'itemCode',
  quantity: 'quantity'
};

exports.Prisma.ModuleOptionScalarFieldEnum = {
  moduleCode: 'moduleCode',
  optionCode: 'optionCode'
};

exports.Prisma.ModulePriceScalarFieldEnum = {
  moduleCode: 'moduleCode',
  priceUsd: 'priceUsd',
  priceRub: 'priceRub'
};

exports.Prisma.CabinetSizeModuleSizeScalarFieldEnum = {
  cabinetSizeCode: 'cabinetSizeCode',
  moduleSizeCode: 'moduleSizeCode'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

exports.Prisma.ModelName = {
  User: 'User',
  ScreenType: 'ScreenType',
  Material: 'Material',
  Location: 'Location',
  Placement: 'Placement',
  Option: 'Option',
  Sensor: 'Sensor',
  ControlType: 'ControlType',
  Pitch: 'Pitch',
  RefreshRate: 'RefreshRate',
  Brightness: 'Brightness',
  Manufacturer: 'Manufacturer',
  Supplier: 'Supplier',
  IpProtection: 'IpProtection',
  ModuleSize: 'ModuleSize',
  CabinetSize: 'CabinetSize',
  ItemCategory: 'ItemCategory',
  ItemSubcategory: 'ItemSubcategory',
  Cabinet: 'Cabinet',
  Module: 'Module',
  Item: 'Item',
  ScreenTypeOption: 'ScreenTypeOption',
  ScreenTypeControlType: 'ScreenTypeControlType',
  ScreenTypeSensor: 'ScreenTypeSensor',
  ItemCategoryRelation: 'ItemCategoryRelation',
  ItemSubcategoryRelation: 'ItemSubcategoryRelation',
  ItemPrice: 'ItemPrice',
  ItemSupplier: 'ItemSupplier',
  ItemCategorySubcategory: 'ItemCategorySubcategory',
  CabinetCategory: 'CabinetCategory',
  CabinetSubcategory: 'CabinetSubcategory',
  CabinetLocation: 'CabinetLocation',
  CabinetPlacement: 'CabinetPlacement',
  CabinetMaterial: 'CabinetMaterial',
  CabinetCabinetSize: 'CabinetCabinetSize',
  CabinetPitch: 'CabinetPitch',
  CabinetManufacturer: 'CabinetManufacturer',
  CabinetSupplier: 'CabinetSupplier',
  CabinetItemComponent: 'CabinetItemComponent',
  CabinetPrice: 'CabinetPrice',
  ModuleCategory: 'ModuleCategory',
  ModuleSubcategory: 'ModuleSubcategory',
  ModuleLocation: 'ModuleLocation',
  ModuleRefreshRate: 'ModuleRefreshRate',
  ModuleBrightness: 'ModuleBrightness',
  ModuleModuleSize: 'ModuleModuleSize',
  ModulePitch: 'ModulePitch',
  ModuleManufacturer: 'ModuleManufacturer',
  ModuleItemComponent: 'ModuleItemComponent',
  ModuleOption: 'ModuleOption',
  ModulePrice: 'ModulePrice',
  CabinetSizeModuleSize: 'CabinetSizeModuleSize'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
