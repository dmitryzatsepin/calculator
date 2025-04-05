// src/validators/materialValidators.ts
import { z } from 'zod';

// --- Вспомогательные схемы ---
const requiredString = z.string({ required_error: "Поле обязательно" })
    .min(1, "Поле не может быть пустым");

// --- Схема для СОЗДАНИЯ Material ---
export const createMaterialSchema = z.object({
  // Поля соответствуют модели Material в schema.prisma
  code: requiredString, // String @unique
  name: requiredString, // String
}).strict("В запросе на создание материала присутствуют лишние поля");

// --- Схема для ОБНОВЛЕНИЯ Material ---
export const updateMaterialSchema = z.object({
    code: requiredString.optional(),
    name: requiredString.optional(),
})
.strict("В запросе на обновление материала присутствуют лишние поля") // Применяем strict к ZodObject
.refine(obj => Object.keys(obj).length > 0, { // Применяем refine к результату strict
    message: "Хотя бы одно поле (code или name) должно быть предоставлено для обновления",
});


// --- Вывод типов TypeScript ---
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;