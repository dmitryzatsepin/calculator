// src/validators/pixelStepDefinitionValidators.ts (Переименован)
import { z } from 'zod';

// --- Вспомогательные схемы ---
const requiredString = z.string({ required_error: "Поле обязательно" })
    .min(1, "Поле не может быть пустым");

const positiveDecimalSchema = z.coerce
    .number({ invalid_type_error: "Значение шага должно быть числом" })
    .positive("Значение шага должно быть положительным числом");

// --- Схема для СОЗДАНИЯ PixelStepDefinition ---
export const createPixelStepDefinitionSchema = z.object({
  code: requiredString,
  stepValue: positiveDecimalSchema,
}).strict("В запросе на создание определения шага пикселя присутствуют лишние поля");

// --- Схема для ОБНОВЛЕНИЯ PixelStepDefinition ---
export const updatePixelStepDefinitionSchema = z.object({
    stepValue: positiveDecimalSchema.optional(),
    // code: requiredString.optional() // НЕ РЕКОМЕНДУЕТСЯ
})
.strict("В запросе на обновление определения шага пикселя присутствуют лишние поля") // 1. Применяем strict к ZodObject
.refine(obj => Object.keys(obj).length > 0, { // 2. Применяем refine к результату strict
    message: "Хотя бы одно поле (stepValue) должно быть предоставлено для обновления",
});


// --- Вывод типов TypeScript ---
export type CreatePixelStepDefinitionInput = z.infer<typeof createPixelStepDefinitionSchema>;
export type UpdatePixelStepDefinitionInput = z.infer<typeof updatePixelStepDefinitionSchema>;