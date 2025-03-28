import { Request, Response, NextFunction } from "express"; // NextFunction может быть не нужна, если используем asyncHandler везде
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler'; // Предполагаем, что asyncHandler вынесен
import { idParamSchema } from '../validators/commonValidators';
import { createPixelStepSchema, updatePixelStepSchema } from '../validators/pixelStepValidators';

// 📌 Получение всех шагов пикселя
export const getPixelSteps = asyncHandler(async (req: Request, res: Response) => {
    const steps = await prisma.pixelStep.findMany();
    res.status(200).json({ message: "Список шагов пикселя", data: steps }); // Используем data
});

// 📌 Создание шага пикселя
export const createPixelStep = asyncHandler(async (req: Request, res: Response) => {
    // Валидация и преобразование с помощью Zod
    const validatedData = createPixelStepSchema.parse(req.body);

    const step = await prisma.pixelStep.create({
        data: validatedData, // Используем валидированные данные
    });

    res.status(201).json({ message: "Шаг пикселя успешно создан", data: step }); // Используем data
});

// 📌 Обновление шага пикселя
export const updatePixelStep = asyncHandler(async (req: Request, res: Response) => {
    // Валидация ID из параметров
    const { id } = idParamSchema.parse(req.params);
    // Валидация данных из тела (частичная)
    const validatedData = updatePixelStepSchema.parse(req.body);

    // Проверка, есть ли что обновлять
    if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ message: "Нет данных для обновления" });
        return;
    }

    const step = await prisma.pixelStep.update({
        where: { id }, // ID уже число
        data: validatedData, // Передаем только валидированные поля
    });

    res.status(200).json({ message: "Шаг пикселя успешно обновлен", data: step }); // Используем data
});

// 📌 Удаление шага пикселя
export const deletePixelStep = asyncHandler(async (req: Request, res: Response) => {
    // Валидация ID
    const { id } = idParamSchema.parse(req.params);

    await prisma.pixelStep.delete({ where: { id } }); // ID уже число

    // Ответ 200 с сообщением или 204 без тела
    res.status(200).json({ message: "Шаг пикселя успешно удален" });
    // или res.status(204).send();
});