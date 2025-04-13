// src/graphql/schema.ts
import { builder } from './builder';

// Импортируем типы
import './types/Location';
import './types/Placement';
import './types/Material';
import './types/Supplier';
import './types/Manufacturer';
import './types/IpProtection';
import './types/Pitch';
import './types/RefreshRate';
import './types/Brightness';
import './types/Option';
import './types/Sensor';
import './types/ControlType';
import './types/ModuleSize';
import './types/CabinetSize';
import './types/ItemCategory';
import './types/ItemSubcategory';
import './types/ScreenType';

import './types/Item'; // Включает ItemPrice
import './types/CabinetItemComponent';
import './types/Cabinet'; // Включает CabinetPrice
//import './types/ModuleItemComponent';
import './types/Module'; // Включает ModulePrice
import './types/User';

// Импортируем запросы
import './queries/screenTypeQueries';
import './queries/locationQueries';
import './queries/materialQueries';
import './queries/ipProtectionQueries';
import './queries/itemQueries';
import './queries/cabinetQueries';
import './queries/moduleQueries';
import './queries/pitchQueries';

// Импортируем мутации
import './mutations/authMutations';

export const schema = builder.toSchema();