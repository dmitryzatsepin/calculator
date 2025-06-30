// backend/src/services/itemService.ts
import { PrismaClient, Prisma, Item } from "../../prisma/generated/client";
import DataLoader from 'dataloader';

export interface ItemFilters {
  onlyActive?: boolean | null;
}

export class ItemService {
  private prisma: PrismaClient;
  // Объявляем Dataloader как свойство класса
  private itemByCodeLoader: DataLoader<string, Item | null>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    // Инициализируем Dataloader в конструкторе
    this.itemByCodeLoader = new DataLoader<string, Item | null>(
      async (codes: readonly string[]) => {
        console.log(`[Dataloader:Item] Batching request for ${codes.length} codes:`, codes);

        // 1. Делаем ОДИН запрос к БД для всех запрошенных кодов
        const items = await this.prisma.item.findMany({
          where: { code: { in: [...codes] } },
        });

        // 2. Создаем карту для быстрого сопоставления code -> item
        const itemMap = new Map<string, Item>();
        items.forEach(item => {
          itemMap.set(item.code, item);
        });

        // 3. Возвращаем массив результатов в ТОМ ЖЕ ПОРЯДКЕ, что и массив кодов
        return codes.map(code => itemMap.get(code) || null);
      }
    );
  }

  /**
   * Находит список Item. Логика пагинации передается через объект query.
   * @param query - Объект с параметрами от Pothos.
   * @param filters - Объект с дополнительными фильтрами.
   * @returns Promise<Item[]>
   */
  async findMany(query: any, filters?: ItemFilters): Promise<Item[]> {
    const where: Prisma.ItemWhereInput = {
      active: filters?.onlyActive ?? undefined,
    };
    return this.prisma.item.findMany({
      ...query,
      where,
    });
  }

  /**
   * Находит один Item по его уникальному коду (прямой вызов к БД).
   * @param query - Объект с параметрами от Pothos.
   * @param code - Уникальный код.
   * @returns Promise<Item | null>
   */
  async findByCode(query: any, code: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      ...query,
      where: { code },
    });
  }

  /**
   * Находит один Item по коду, используя Dataloader для предотвращения N+1.
   * @param code - Уникальный код.
   * @returns Promise<Item | null>
   */
  async findByCodeWithLoader(code: string): Promise<Item | null> {
    console.log(`[ItemService] Loading item with code via Dataloader: ${code}`);
    return this.itemByCodeLoader.load(code);
  }
}