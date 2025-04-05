// src/validators/moduleValidators.ts
import { z } from 'zod';

// --- Вспомогательные схемы ---
const requiredString = z.string({ required_error: "Поле обязательно" })
    .min(1, "Поле не может быть пустым");

const positiveInt = z.coerce // Преобразуем в число, проверяем > 0
    .number({ invalid_type_error: "Должно быть целым положительным числом" })
    .int("Должно быть целым числом")
    .positive("Должно быть положительным числом");

const optionalPositiveInt = z.coerce
    .number({ invalid_type_error: "Должно быть целым положительным числом" })
    .int("Должно быть целым числом")
    .positive("Должно быть положительным числом")
    .optional(); // Необязательное

const optionalPriceSchema = z.coerce
    .number({ invalid_type_error: "Цена должна быть числом" })
    .nonnegative("Цена не может быть отрицательной")
    .nullable() // Разрешаем null
    .optional(); // Разрешаем undefined

// --- Схема для СОЗДАНИЯ Module ---
export const createModuleSchema = z.object({
  // --- Основные поля ---
  sku: requiredString, // Обязательный, уникальность проверит база
  type: z.string().optional(), // Необязательный
  moduleWidth: positiveInt,   // Обязательный
  moduleHeight: positiveInt,  // Обязательный
  moduleFrequency: optionalPositiveInt, // Необязательный
  moduleBrightness: optionalPositiveInt, // Необязательный
  priceUsd: optionalPriceSchema, // Необязательный

  // --- Поля для связей (передаем идентификаторы) ---
  manufacturerCode: z.string().optional(), // Необязательный код производителя (String?)
  screenTypeId: positiveInt,               // Обязательный ID типа экрана (Int)
  pixelCode: requiredString,               // Обязательный код шага пикселя (String)

}).strict("В запросе на создание модуля присутствуют лишние поля");

// --- Схема для ОБНОВЛЕНИЯ Module ---
// Все поля делаем необязательными для PATCH
export const updateModuleSchema = createModuleSchema
    .partial() // Все поля становятся optional()
    .strict("В запросе на обновление модуля присутствуют лишние поля")
    .refine(obj => Object.keys(obj).length > 0, {
        message: "Хотя бы одно поле должно быть предоставлено для обновления",
    });

// --- Вывод типов TypeScript ---
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;