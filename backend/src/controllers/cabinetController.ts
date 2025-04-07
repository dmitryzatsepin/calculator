// src/controllers/cabinetController.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma, ComponentService, Cabinet, Material, ScreenType } from '@prisma/client'; // Уберем лишние импорты позже
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';


// --- Интерфейсы для типизации связанных данных ---
interface ComponentDetail {
    componentId: number;
    code: string;
    name: string;
    quantity: number;
    priceUsd: Decimal | null;
    priceRub: Decimal | null;
    category?: string | null;
}

interface CabinetComponentRelation {
    quantity: number;
    component: {
        id: number;
        code: string;
        name: string;
        priceUsd: Decimal | null;
        priceRub: Decimal | null;
        category?: string | null;
    }
}

// --- Тип для получения Кабинета с деталями через Prisma GetPayload ---
type CabinetWithDetails = Prisma.CabinetGetPayload<{
  include: {
    // Связи, которые ЕСТЬ в текущей модели Cabinet:
    locations: { // Связь M-N LocationCabinet
        include: { location: { select: { code: true, name: true } } }
    };
    materials: { // Связь M-N MaterialCabinet
        include: { material: { select: { code: true, name: true } } }
    };
    placements: { // Связь M-N CabinetPlacementCabinet
        include: { placement: { select: { code: true, name: true } } }
    };
    components: { // Связь M-N CabinetComponent
        select: {
            quantity: true;
            component: { // Включаем детали ComponentService
                select: { id: true; code: true; name: true; priceUsd: true; priceRub: true; category: true }
            }
        }
    };
    // Связей с ScreenType, Pitch и т.д. напрямую у Кабинета НЕТ
  }
}>

// --- Хелпер для преобразования Cabinet в ответ API ---
const mapCabinetToResponse = (cabinet: CabinetWithDetails | null) => {
    if (!cabinet) return null;
    // Деструктурируем только те поля связей, которые реально есть в CabinetWithDetails
    const {
        locations, materials, placements, components,
        priceUsd,
        ...rest // Остальные поля модели Cabinet (id, sku, name, width, height, moduleWidth, moduleHeight, modulesCount, etc.)
    } = cabinet;

    // Собираем данные из связей
    const locationInfo = locations?.[0]?.location; // Пример: берем первую локацию (если связь 1-M или фильтровалась)
                                                 // Или собираем массив: locations?.map(lc => lc.location) ?? []
    const materialInfo = materials?.map(mc => mc.material) ?? []; // Массив объектов Material
    const placementInfo = placements?.[0]?.placement; // Пример: берем первое размещение

    // Обрабатываем компоненты (остается как было)
    const componentDetails: ComponentDetail[] = components?.map((comp): ComponentDetail => ({
        componentId: comp.component.id,
        code: comp.component.code,
        name: comp.component.name,
        quantity: comp.quantity,
        priceUsd: comp.component.priceUsd,
        priceRub: comp.component.priceRub,
        category: comp.component.category,
    })) ?? [];

    // --- Поиск ключевых компонентов (оставляем, но коды/категории нужно проверить) ---
    let powerUnitInfo = componentDetails.find((c: ComponentDetail) => c.category === 'Блоки питания'); // Ищем по категории
    let receiverInfo = componentDetails.find((c: ComponentDetail) => c.category === 'Приемные карты'); // Ищем по категории
    let coolerInfo = componentDetails.find((c: ComponentDetail) => c.category === 'Охлаждение');

    // --- Формирование ответа ---
    return {
        // Основные поля из rest (т.е. из модели Cabinet)
        id: rest.id,
        sku: rest.sku,
        name: rest.name,
        width: rest.width,
        height: rest.height,
        moduleWidth: rest.moduleWidth,
        moduleHeight: rest.moduleHeight,
        modulesCount: rest.modulesCount,
        priceUsd: priceUsd?.toString() ?? null, // Конвертируем Decimal в строку

        // Данные из связей (примеры)
        locationCode: locationInfo?.code ?? null,
        locationName: locationInfo?.name ?? null,
        materialCodes: materialInfo.map(m => m.code), // Массив кодов материалов
        placementCode: placementInfo?.code ?? null,
        placementName: placementInfo?.name ?? null,

        // Информация о компонентах (примеры)
        powerUnitName: powerUnitInfo?.name ?? null,
        powerUnitQuantity: powerUnitInfo?.quantity ?? 0,
        receiverName: receiverInfo?.name ?? null,
        receiverQuantity: receiverInfo?.quantity ?? 0,
        coolerQuantity: coolerInfo?.quantity ?? 0,

        // Детали всех компонентов (если нужно)
        // components: componentDetails.map(c => ({...c, priceUsd: c.priceUsd?.toString() ?? null, priceRub: c.priceRub?.toString() ?? null })),

        createdAt: rest.createdAt,
        updatedAt: rest.updatedAt,
    };
};


// 📌 Получение всех кабинетов (Переименовано и обновлено include)
export const getAllCabinets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const cabinets = await prisma.cabinet.findMany({
        orderBy: { sku: 'asc' }, // Сортируем по SKU
        include: { // Включаем все актуальные связи
            locations: { include: { location: { select: { code: true, name: true } } } },
            materials: { include: { material: { select: { code: true, name: true } } } },
            placements: { include: { placement: { select: { code: true, name: true } } } },
            components: {
                select: {
                    quantity: true,
                    component: { select: { id: true, code: true, name: true, priceUsd: true, priceRub: true, category: true } }
                }
            }
        }
    });
    // Используем обновленный маппер
    const responseData = cabinets.map(mapCabinetToResponse);
    // Возвращаем чистый массив данных (как в других контроллерах)
    res.status(200).json(responseData);
});