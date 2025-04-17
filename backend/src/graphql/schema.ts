// src/graphql/schema.ts
import { builder } from './builder';

// Импортируем типы
import './types/User';
import './types/ScreenType';
import './types/Location';
import './types/Placement';
import './types/Material';
import './types/RefreshRate';
import './types/Brightness';
import './types/IpProtection';
import './types/Sensor';
import './types/ControlType';
import './types/Pitch';
import './types/Module';
import './types/ModuleSize';
import './types/Option';
import './types/Cabinet';
import './types/CabinetSize';
import './types/Manufacturer';
import './types/Supplier';
import './types/Item';
import './types/ItemCategory';
import './types/ItemSubcategory';
import './types/CabinetItemComponent';

// Импортируем запросы
import './queries/screenTypeQueries';
import './queries/locationQueries';
import './queries/materialQueries';
import './queries/refreshRateQueries';
import './queries/brightnessQueries';
import './queries/ipProtectionQueries';
import './queries/sensorQueries';
import './queries/controlTypeQueries';
import './queries/pitchQueries';
import './queries/moduleQueries';
import './queries/optionQueries';
import './queries/cabinetQueries';
import './queries/itemQueries';
import './queries/exchangeRateQueries';

// Импортируем мутации
import './mutations/authMutations';

export const schema = builder.toSchema();