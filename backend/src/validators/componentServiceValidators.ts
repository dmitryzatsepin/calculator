import { z } from 'zod';

// --- Вспомогательные схемы ---
const requiredString = z.string({ required_error: "Поле обязательно" })
    .min(1, "Поле не может быть пустым");

const optionalPriceSchema = z.coerce
    .number({ invalid_type_error: "Цена должна быть числом" })
    .nonnegative("Цена не может быть отрицательной")
    .nullable()
    .optional();

// --- Схема для СОЗДАНИЯ ComponentService ---
export const createComponentServiceSchema = z.object({
  category: z.string().optional(),
  code: requiredString,
  name: requiredString,
  priceUsd: optionalPriceSchema,
  priceRub: optionalPriceSchema,
}).strict("В запросе на создание ComponentService присутствуют лишние поля");

// --- Схема для ОБНОВЛЕНИЯ ComponentService ---
export const updateComponentServiceSchema = createComponentServiceSchema
    .partial() // 1. Делаем все поля необязательными
    .strict("В запросе на обновление ComponentService присутствуют лишние поля") // 2. Применяем strict к ZodObject (результату partial)
    .refine(obj => Object.keys(obj).length > 0, { // 3. Применяем refine к результату strict
        message: "Хотя бы одно поле должно быть предоставлено для обновления",
    });


// --- Вывод типов TypeScript ---
export type CreateComponentServiceInput = z.infer<typeof createComponentServiceSchema>;
export type UpdateComponentServiceInput = z.infer<typeof updateComponentServiceSchema>;