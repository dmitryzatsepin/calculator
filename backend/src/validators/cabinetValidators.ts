import { z } from 'zod';

const componentInputSchema = z.object({
    componentCode: z.string().min(1, "Код компонента обязателен"),
    quantity: z.coerce.number().int().positive("Количество компонента должно быть положительным числом"),
}).strict("В объекте компонента разрешены только поля componentCode и quantity"); // Запрещаем лишние поля

// --- Схема для СОЗДАНИЯ кабинета ---
export const createCabinetSchema = z.object({

    // --- Основные поля Cabinet ---
    sku: z.string().min(1, "SKU обязателен"),
    name: z.string().min(1, "Имя не может быть пустым").optional(),
    width: z.coerce.number().int().positive("Ширина должна быть положительным числом").optional(),
    height: z.coerce.number().int().positive("Высота должна быть положительным числом").optional(),
    modulesCount: z.coerce.number().int().positive("Кол-во модулей должно быть положительным числом").optional(), // 
    placement: z.string().min(1, "Размещение не может быть пустым").optional(),
    priceUsd: z.coerce.number().nonnegative("Цена USD не может быть отрицательной").optional(),

    // --- Связи ---
    location: z.string().min(1, "Локация (имя типа экрана) не может быть пустой").optional(),

    materialCodes: z.array(z.string().min(1, "Код материала не может быть пустым"))
        .min(1, "Требуется хотя бы один код материала"),

    components: z.array(componentInputSchema)
        .optional(),

  }).strict("В запросе на создание кабинета присутствуют лишние поля");
  

// --- Схема для ОБНОВЛЕНИЯ кабинета ---
export const updateCabinetSchema = createCabinetSchema.partial()
    .refine(obj => Object.keys(obj).length > 0, {
         message: "Хотя бы одно поле должно быть предоставлено для обновления",
    });


// --- Вывод типов TypeScript из схем Zod ---
export type CreateCabinetInput = z.infer<typeof createCabinetSchema>;
export type UpdateCabinetInput = z.infer<typeof updateCabinetSchema>;