// src/validators/screenTypeValidators.ts
import { z } from 'zod';

// --- Вспомогательные схемы ---
const requiredString = z.string({ required_error: "Поле обязательно" })
    .min(1, "Поле не может быть пустым");

// Для brightness: необязательное целое положительное число
const optionalPositiveInt = z.coerce
    .number({ invalid_type_error: "Яркость должна быть целым положительным числом" })
    .int("Яркость должна быть целым числом")
    .positive("Яркость должна быть положительным числом")
    .optional(); // Необязательное

// Для массивов кодов: массив строк, каждая строка непустая
const optionalArrayOfStrings = z.array(
        z.string().min(1, "Код в массиве не может быть пустым")
    )
    .optional(); // Сам массив необязателен

// --- Схема для СОЗДАНИЯ ScreenType ---
export const createScreenTypeSchema = z.object({
  // --- Основные поля ---
  name: requiredString, // String @unique -> обязательная непустая строка. Уникальность проверит база.
  brightness: optionalPositiveInt, // Int? -> необязательное целое положительное число

  // --- Поля для связей M-N (передаем массивы кодов) ---
  materialCodes: optionalArrayOfStrings, // Коды материалов для связи
  optionCodes: optionalArrayOfStrings,   // Коды опций для связи

}).strict("В запросе на создание типа экрана присутствуют лишние поля");

// --- Схема для ОБНОВЛЕНИЯ ScreenType ---
// Все поля делаем необязательными для PATCH
export const updateScreenTypeSchema = createScreenTypeSchema
    .partial() // Все поля становятся optional()
    .strict("В запросе на обновление типа экрана присутствуют лишние поля")
    .refine(obj => Object.keys(obj).length > 0, {
        message: "Хотя бы одно поле (name, brightness, materialCodes, optionCodes) должно быть предоставлено для обновления",
    });

// --- Вывод типов TypeScript ---
export type CreateScreenTypeInput = z.infer<typeof createScreenTypeSchema>;
export type UpdateScreenTypeInput = z.infer<typeof updateScreenTypeSchema>;