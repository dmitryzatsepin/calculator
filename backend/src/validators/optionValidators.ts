// src/validators/optionValidators.ts
import { z } from 'zod';

// --- Вспомогательные схемы ---
const requiredString = z.string({ required_error: "Поле обязательно" })
    .min(1, "Поле не может быть пустым");

// --- Схема для СОЗДАНИЯ Option ---
export const createOptionSchema = z.object({
  // Поля соответствуют модели Option в schema.prisma
  code: requiredString, // String @unique
  name: requiredString, // String @unique
}).strict("В запросе на создание опции присутствуют лишние поля");

// --- Схема для ОБНОВЛЕНИЯ Option ---
// Разрешаем обновлять code или name. Оба должны оставаться уникальными.
export const updateOptionSchema = z.object({
    code: requiredString.optional(),
    name: requiredString.optional(),
})
.strict("В запросе на обновление опции присутствуют лишние поля")
.refine(obj => Object.keys(obj).length > 0, {
    message: "Хотя бы одно поле (code или name) должно быть предоставлено для обновления",
});


// --- Вывод типов TypeScript ---
export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;