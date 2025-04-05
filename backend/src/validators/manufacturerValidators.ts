// src/validators/manufacturerValidators.ts
import { z } from 'zod';

// --- Вспомогательные схемы ---
const requiredString = z.string({ required_error: "Поле обязательно" })
    .min(1, "Поле не может быть пустым");

// --- Схема для СОЗДАНИЯ Manufacturer ---
export const createManufacturerSchema = z.object({
  // Поля соответствуют модели Manufacturer в schema.prisma
  code: requiredString, // String @unique -> обязательная непустая строка. Уникальность проверит база данных.
  name: requiredString, // String -> обязательная непустая строка.
}).strict("В запросе на создание производителя присутствуют лишние поля");

// --- Схема для ОБНОВЛЕНИЯ Manufacturer ---
// Позволяем обновлять любое из полей (code или name).
// Обновление 'code' (уникального идентификатора) может быть нежелательным,
// но если бизнес-логика позволяет, оставляем.
export const updateManufacturerSchema = z.object({
    code: requiredString.optional(),
    name: requiredString.optional(),
})
.strict("В запросе на обновление производителя присутствуют лишние поля") // Применяем strict к ZodObject
.refine(obj => Object.keys(obj).length > 0, { // Применяем refine к результату strict
    message: "Хотя бы одно поле (code или name) должно быть предоставлено для обновления",
});


// --- Вывод типов TypeScript ---
export type CreateManufacturerInput = z.infer<typeof createManufacturerSchema>;
export type UpdateManufacturerInput = z.infer<typeof updateManufacturerSchema>;