// prisma/seed/clearDatabase.ts
import { PrismaClient, Prisma } from '@prisma/client';

export async function clearDatabase(prisma: PrismaClient): Promise<void> {
  console.log('🧹 Начало очистки базы данных...');
  const startTime = Date.now();

  const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);
  
  // Используем ИМЕНА МОДЕЛЕЙ из schema.prisma (CamelCase)
  const deletionOrder: string[] = [
    // Связующие таблицы M-N
    'ItemCategorySubcategory',
    'CabinetPitch',
    'CabinetPlacementRelation',
    'CabinetItemComponent',
    'ModuleItemComponent',
    'CabinetCategory',          
    'CabinetSubcategory',       
    'CabinetLocation',          
    'CabinetMaterial',          
    'CabinetCabinetSize',       
    'CabinetManufacturer',      
    'CabinetSupplier',          
    'ModuleCategory',           
    'ModuleSubcategory',        
    'ModuleLocation',           
    'ModuleRefreshRate',        
    'ModuleBrightness',         
    'ModuleModuleSize',         
    'ModulePitch',              
    'ModuleManufacturer',       
    'ModuleOption',             
    'ItemPrice',                
    'ItemSupplier',             
    'CabinetPrice',             
    'ModulePrice',              
    'CabinetSizeModuleSize',    
    'ScreenTypeOption',         
    'ScreenTypeControlType',    
    'ScreenTypeSensor',      
    
    // Основные сущности
    'Item',
    'Module',
    'Cabinet',

    // Справочники (в порядке уменьшения зависимостей)
    'ItemSubcategory',
    'ItemCategory',
    'CabinetSize',
    'ModuleSize',
    'IpProtection',
    'Supplier',
    'Manufacturer',
    'Brightness',
    'RefreshRate',
    'Pitch',
    'Placement',
    'Location',
    'Material',
    'ControlType',
    'Sensor',
    'Option',
    'ScreenType',
    // User не удаляем
  ];

  const validDeletionOrder = deletionOrder.filter(name => modelNames.includes(name));
  const remainingModels = modelNames.filter(name => !deletionOrder.includes(name) && name !== 'User'); 
  const finalDeletionOrder = [...validDeletionOrder, ...remainingModels];

  console.log('Порядок удаления моделей Prisma:', finalDeletionOrder.join(', '));

  try {
    for (const modelName of finalDeletionOrder) {
        if (modelName === 'User') continue; 

        const prismaModel = (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)];
        if (prismaModel && typeof prismaModel.deleteMany === 'function') {
             console.log(`  - Очистка ${modelName}...`);
             await prismaModel.deleteMany({});
        } else {
             console.warn(`  - Не удалось найти метод deleteMany для модели ${modelName}. Пропуск.`);
        }
    }
    const endTime = Date.now();
    console.log(`✅ Очистка базы данных завершена за ${(endTime - startTime) / 1000} сек.`);
  } catch (error) {
      console.error('❌ Ошибка во время очистки базы данных:', error);
      throw error; 
  } 
}