// --- Базовые Справочники ---

// Совпадает с Prisma Enum Role
export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
  }
  
  // Тип для пользователя (без пароля, как приходит с API)
  export interface User {
    id: number;
    email: string;
    role: Role;
    createdAt: string; // Prisma возвращает DateTime как строку ISO 8601
    name: string;
  }
  // Тип для категории расчета (без пароля, как приходит с API)
  export interface CalculationType {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  // Тип для Material (соответствует Prisma модели)
  export interface Material {
    id: number;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    // Мы не будем запрашивать screenTypes и cabinets здесь напрямую
  }
  
  // Тип для Option (соответствует Prisma модели)
  export interface Option {
    id: number;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Тип для Manufacturer (соответствует Prisma модели)
  export interface Manufacturer {
    id: number;
    code: string;
    name:string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Тип для ScreenType (пока без связей, их будем получать отдельно)
  export interface ScreenType {
    id: number;
    name: string;
    brightness: number | null; // Может быть null
    createdAt: string;
    updatedAt: string;
  }

  // --- 👇 НОВЫЙ ТИП для данных, приходящих от /api/v1/screen-types ---
// Описывает ОДИН элемент массива 'data' в ответе API
export interface ScreenTypeFromApi extends ScreenType {
    materials: { code: string; name: string }[]; // Упрощенный список материалов
    options: { code: string; name: string }[];   // Упрощенный список опций
  }
  
  // Тип для ВСЕГО объекта ответа от /api/v1/screen-types
  export interface ScreenTypeListApiResponse {
    message: string;
    data: ScreenTypeFromApi[]; // Массив объектов типа ScreenTypeFromApi
  }
  
  // Тип для IpProtection (соответствует Prisma модели)
  export interface IpProtection {
    id: number;
    code: string;
    protectionSolid: string;
    protectionWater: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Тип для ComponentService (соответствует Prisma модели)
  // Prisma Decimal приходит как строка, но лучше преобразовать в number на клиенте
  export interface ComponentService {
    id: number;
    category: string | null;
    code: string;
    name: string;
    priceUsd: string | null; // Приходит как строка
    priceRub: string | null; // Приходит как строка
    createdAt: string;
    updatedAt: string;
  }
  
  // --- Модели, связанные с Pixel ---
  
  // Тип для PixelStepDefinition (соответствует Prisma модели)
  export interface PixelStepDefinition {
    id: number;
    code: string;
    stepValue: string; // Приходит как строка из Decimal
    createdAt: string;
    updatedAt: string;
  }
  
  // Тип для PixelType (соответствует Prisma модели)
  export interface PixelType {
    id: number;
    type: string;
    frequency: number | null;
    createdAt: string;
    updatedAt: string;
  }
  
  // Тип для PixelOption (без вложенных объектов по умолчанию)
  export interface PixelOption {
    id: number;
    pixelCode: string;
    moduleWidth: number;
    moduleHeight: number;
    optionName: string | null;
    stepDefinitionId?: number; // ID для связи, если не используем include
    pixelTypeId: number | null;
    screenTypeId: number | null;
    createdAt: string;
    updatedAt: string;
    
    // Опционально: если БУДЕМ запрашивать с include
    // stepDefinition?: PixelStepDefinition;
    // pixelType?: PixelType;
    // screenType?: ScreenType;
  }
  
  // --- Зависимые сущности ---
  
  // Тип для Module (без вложенных объектов по умолчанию)
  export interface Module {
    id: number;
    sku: string;
    type: string | null;
    moduleWidth: number;
    moduleHeight: number;
    moduleFrequency: number | null;
    moduleBrightness: number | null;
    priceUsd: string | null; // Приходит как строка из Decimal
    manufacturerCode: string | null;
    screenTypeId: number;
    pixelCode: string; // Ссылка на PixelStepDefinition
    createdAt: string;
    updatedAt: string;
  
    // Опционально: если БУДЕМ запрашивать с include
    // manufacturer?: Manufacturer;
    // screenType?: ScreenType;
    // stepDefinition?: PixelStepDefinition;
  }
  
  // Тип для Cabinet (без вложенных объектов по умолчанию)
  export interface Cabinet {
    id: number;
    sku: string;
    name: string | null;
    width: number | null;
    height: number | null;
    placement: string | null;
    moduleWidth: number | null;
    moduleHeight: number | null;
    modulesCount: number | null;
    priceUsd: string | null; // Приходит как строка из Decimal
    screenTypeId: number | null;
    createdAt: string;
    updatedAt: string;
  
    // Опционально: если БУДЕМ запрашивать с include
    // screenType?: ScreenType;
    // Мы не будем запрашивать materials и components здесь напрямую
  }
  
  
  // --- Связующие таблицы M-N ---
  // Обычно при запросе к ним мы используем include, поэтому определим типы с вложенными объектами
  
  export interface ScreenTypeMaterialRelation {
    screenTypeId: number;
    materialId: number;
    screenType: ScreenType; // Ожидаем вложенный объект
    material: Material;     // Ожидаем вложенный объект
  }
  
  export interface ScreenTypeOptionRelation {
    screenTypeId: number;
    optionId: number;
    screenType: ScreenType; // Ожидаем вложенный объект
    option: Option;         // Ожидаем вложенный объект
  }
  
  export interface CabinetMaterialRelation {
    cabinetId: number;
    materialId: number;
    cabinet: Cabinet;   // Ожидаем вложенный объект
    material: Material; // Ожидаем вложенный объект
  }
  
  export interface CabinetComponentRelation {
    cabinetId: number;
    componentId: number;
    quantity: number;
    cabinet: Cabinet;           // Ожидаем вложенный объект
    component: ComponentService; // Ожидаем вложенный объект
  }
  
  
  // --- Типы для специфичных запросов (можно добавлять по мере необходимости) ---
  
  // Например, тип для запроса списка ScreenType с вложенными связями
  export interface ScreenTypeWithRelations extends ScreenType {
    materials: ScreenTypeMaterialRelation[];
    options: ScreenTypeOptionRelation[];
  }