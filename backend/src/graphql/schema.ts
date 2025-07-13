// src/graphql/schema.ts
import { builder } from './builder.js';

// Импортируем типы
import './types/User.js';
import './types/ScreenType.js';
import './types/Location.js';
import './types/Placement.js';
import './types/Material.js';
import './types/RefreshRate.js';
import './types/Brightness.js';
import './types/IpProtection.js';
import './types/Sensor.js';
import './types/ControlType.js';
import './types/Pitch.js';
import './types/Module.js';
import './types/ModuleBrightness.js';
import './types/ModuleItemComponent.js';
import './types/ModulePrice.js';
import './types/ModuleRefreshRate.js';
import './types/ModuleSize.js';
import './types/ModuleModuleSize.js';
import './types/Option.js';
import './types/Cabinet.js';
import './types/CabinetSize.js';
import './types/CabinetCabinetSize.js';
import './types/Manufacturer.js';
import './types/Supplier.js';
import './types/Item.js';
import './types/ItemCategory.js';
import './types/ItemSubcategory.js';
import './types/CabinetItemComponent.js';

// Импортируем запросы
import './queries/screenTypeQueries.js';
import './queries/locationQueries.js';
import './queries/materialQueries.js';
import './queries/refreshRateQueries.js';
import './queries/brightnessQueries.js';
import './queries/ipProtectionQueries.js';
import './queries/sensorQueries.js';
import './queries/controlTypeQueries.js';
import './queries/pitchQueries.js';
import './queries/moduleQueries.js';
import './queries/optionQueries.js';
import './queries/cabinetQueries.js';
import './queries/itemQueries.js';
import './queries/exchangeRateQueries.js';
import './queries/priceQueries.js'

// Импортируем мутации
import './mutations/authMutations.js';

export const schema = builder.toSchema();