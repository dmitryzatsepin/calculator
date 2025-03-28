// src/validators/pixelStepValidators.ts (Новый файл)
import { z } from 'zod';

// Определяем базовые типы и ограничения
const positiveInt = z.coerce.number().int().positive("Должно быть положительным целым числом");
const nonNegativeInt = z.coerce.number().int().nonnegative("Не может быть отрицательным");
const requiredString = z.string().min(1, "Поле обязательно");

// Схема для создания шага пикселя
export const createPixelStepSchema = z.object({
    name: requiredString,
    type: requiredString,
    width: positiveInt,
    height: positiveInt,
    location: requiredString,
    option: z.array(z.string()).min(1, "Хотя бы одна опция обязательна"),
    brightness: nonNegativeInt,
    refreshFreq: nonNegativeInt,
});

// Схема для обновления (все поля необязательны)
export const updatePixelStepSchema = createPixelStepSchema.partial();

// Типы для данных
export type CreatePixelStepInput = z.infer<typeof createPixelStepSchema>;
export type UpdatePixelStepInput = z.infer<typeof updatePixelStepSchema>;