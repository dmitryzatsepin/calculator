// src/validators/cabinetValidators.ts (новый файл)
import { z } from 'zod';

// Схема для создания кабинета
export const createCabinetSchema = z.object({
    name: z.string().min(1, "Имя обязательно"),
    width: z.coerce.number().int().positive("Ширина должна быть положительным числом"), // coerce пытается преобразовать строку в число
    height: z.coerce.number().int().positive("Высота должна быть положительным числом"),
    modulesQ: z.coerce.number().int().positive("Кол-во модулей должно быть положительным числом"),
    powerUnit: z.string().min(1, "Тип блока питания обязателен"),
    powerUnitQ: z.coerce.number().int().positive("Кол-во блоков питания должно быть положительным числом"),
    powerUnitCapacity: z.coerce.number().int().positive("Мощность блока питания должна быть положительным числом"),
    receiver: z.coerce.number().int().positive("Кол-во приемников должно быть положительным числом"),
    cooler: z.coerce.number().int().nonnegative("Кол-во кулеров не может быть отрицательным"), // 0 - допустимо
    pixelStep: z.array(z.string()).min(1, "Хотя бы один шаг пикселя обязателен"),
    location: z.string().min(1, "Локация обязательна"),
    material: z.array(z.string()).min(1, "Хотя бы один материал обязателен"),
    placement: z.string().min(1, "Размещение обязательно"),
    priceUsd: z.coerce.number().nonnegative("Цена USD не может быть отрицательной").optional().default(0),
    mountPriceRub: z.coerce.number().nonnegative("Цена монтажа не может быть отрицательной").optional().default(0),
    deliveryPriceRub: z.coerce.number().nonnegative("Цена доставки не может быть отрицательной").optional().default(0),
    addPriceRub: z.coerce.number().nonnegative("Доп. цена не может быть отрицательной").optional().default(0),
});

// Схема для обновления кабинета (делаем все поля необязательными для PATCH)
// Если используете PUT, можно скопировать createCabinetSchema
export const updateCabinetSchema = createCabinetSchema.partial(); // Все поля становятся optional

// Тип для данных создания, выведенный из схемы
export type CreateCabinetInput = z.infer<typeof createCabinetSchema>;
// Тип для данных обновления
export type UpdateCabinetInput = z.infer<typeof updateCabinetSchema>;