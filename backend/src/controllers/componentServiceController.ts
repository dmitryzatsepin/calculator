import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client"; // Prisma и типы ошибок
import { Decimal } from "@prisma/client/runtime/library"; // Для Decimal
import { prisma } from "../lib/prisma"; // Экземпляр Prisma
import { asyncHandler } from "../middleware/asyncHandler"; // Обработчик async
import { idParamSchema } from "../validators/commonValidators"; // Валидатор ID
import {
  // ИЗМЕНЕНО: Импортируем схемы для ComponentService
  createComponentServiceSchema,
  updateComponentServiceSchema,
} from "../validators/componentServiceValidators"; // Валидаторы ComponentService

// 📌 Получение всех комплектующих/услуг (ComponentService)
// ИЗМЕНЕНО: getParts -> getComponentServices
export const getComponentServices = asyncHandler(async (req: Request, res: Response) => {
  // ИЗМЕНЕНО: prisma.part -> prisma.componentService
  const componentServices = await prisma.componentService.findMany({
    // ИЗМЕНЕНО: Сортируем по имени или коду
    orderBy: { name: "asc" },
  });
  res
    .status(200)
    .json({ message: "Список комплектующих и услуг", data: componentServices });
});

// 📌 Получение одного комплектующего/услуги по ID
// ИЗМЕНЕНО: getPartById -> getComponentServiceById
export const getComponentServiceById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    try {
      // ИЗМЕНЕНО: prisma.part -> prisma.componentService
      const componentService = await prisma.componentService.findUniqueOrThrow({
        where: { id },
      });
      // ИЗМЕНЕНО: Сообщение в ответе
      res.status(200).json({ message: "Комплектующее/услуга найдено", data: componentService });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025" // RecordNotFound
      ) {
        res.status(404);
        // ИЗМЕНЕНО: Сообщение об ошибке
        return next(new Error(`Комплектующее/услуга (ComponentService) с ID ${id} не найдено.`));
      }
      return next(e);
    }
  }
);

// 📌 Создание нового комплектующего/услуги (ComponentService)
// ИЗМЕНЕНО: createPart -> createComponentService
export const createComponentService = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // ИЗМЕНЕНО: Используем схему для ComponentService
    const validatedData = createComponentServiceSchema.parse(req.body);

    // ИЗМЕНЕНО: Деструктурируем поля из новой схемы
    const { category, code, name, priceUsd, priceRub } = validatedData;

    // ИЗМЕНЕНО: Проверка уникальности по полю 'code'
    const existingComponent = await prisma.componentService.findUnique({
      where: { code: code }, // Проверяем уникальность code
      select: { id: true }, // Достаточно получить ID
    });
    if (existingComponent) {
      res.status(409); // Conflict
      // ИЗМЕНЕНО: Сообщение об ошибке
      return next(
        new Error(
          `Комплектующее/услуга (ComponentService) с кодом '${code}' уже существует.`
        )
      );
    }

    try {
      // ИЗМЕНЕНО: prisma.part.create -> prisma.componentService.create
      const newComponentService = await prisma.componentService.create({
        data: {
          // ИЗМЕНЕНО: Используем поля из validatedData
          category: category, // Может быть undefined, Prisma обработает (т.к. String?)
          code: code,
          name: name,
          // Обрабатываем Decimal? - Prisma Client принимает number/string/null
          priceUsd:
            priceUsd !== undefined && priceUsd !== null
              ? new Prisma.Decimal(priceUsd)
              : null,
          priceRub:
            priceRub !== undefined && priceRub !== null
              ? new Prisma.Decimal(priceRub)
              : null,
        },
      });
      res
        .status(201)
        .json({
          message: "Комплектующее/услуга успешно создано",
          data: newComponentService, // Возвращаем созданный объект
        });
    } catch (e: any) {
      // Ловим ошибку уникальности (P2002), которая должна касаться 'code'
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        res.status(409);
        // ИЗМЕНЕНО: Уточняем ошибку
        return next(
          new Error(
            `Ошибка уникальности при создании ComponentService. Поле 'code' (${code}) должно быть уникальным.`
          )
        );
      }
      return next(e); // Передаем другие ошибки дальше
    }
  }
);

// 📌 Обновление комплектующего/услуги (ComponentService)
// ИЗМЕНЕНО: updatePart -> updateComponentService
export const updateComponentService = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    // ИЗМЕНЕНО: Используем схему обновления для ComponentService
    const validatedData = updateComponentServiceSchema.parse(req.body);
    // ИЗМЕНЕНО: Деструктурируем возможные поля
    const { category, code, name, priceUsd, priceRub } = validatedData;

    // Проверка на пустое тело уже сделана в валидаторе updateComponentServiceSchema с помощью .refine()

    // ИЗМЕНЕНО: Если обновляется 'code', проверяем его уникальность
    if (code) {
      const existingComponent = await prisma.componentService.findUnique({
        where: { code: code },
        select: { id: true },
      });
      // Если компонент с таким кодом найден и это НЕ текущий обновляемый компонент
      if (existingComponent && existingComponent.id !== id) {
        res.status(409); // Conflict
        // ИЗМЕНЕНО: Сообщение об ошибке
        return next(
          new Error(
            `Комплектующее/услуга (ComponentService) с кодом '${code}' уже существует.`
          )
        );
      }
    }

    // Собираем данные для обновления только из переданных полей
    // ИЗМЕНЕНО: Тип Prisma.ComponentServiceUpdateInput
    const dataToUpdate: Prisma.ComponentServiceUpdateInput = {};
    if (category !== undefined) dataToUpdate.category = category; // Учитываем null или пустую строку, если переданы
    if (code !== undefined) dataToUpdate.code = code;
    if (name !== undefined) dataToUpdate.name = name;
    // Обрабатываем цены, если они переданы
    if (priceUsd !== undefined)
      dataToUpdate.priceUsd =
        priceUsd !== null ? new Prisma.Decimal(priceUsd) : null;
    if (priceRub !== undefined)
      dataToUpdate.priceRub =
        priceRub !== null ? new Prisma.Decimal(priceRub) : null;

    try {
      // ИЗМЕНЕНО: prisma.part.update -> prisma.componentService.update
      const updatedComponentService = await prisma.componentService.update({
        where: { id },
        data: dataToUpdate,
      });
      res
        .status(200)
        .json({
          message: "Комплектующее/услуга успешно обновлено",
          data: updatedComponentService, // Возвращаем обновленный объект
        });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") { // RecordNotFound
          res.status(404);
          // ИЗМЕНЕНО: Сообщение об ошибке
          return next(new Error(`Комплектующее/услуга (ComponentService) с ID ${id} не найдено.`));
        } else if (e.code === "P2002") { // Unique constraint violation
          res.status(409);
          // ИЗМЕНЕНО: Уточняем ошибку (должна быть связана с 'code')
          return next(
            new Error(
              `Ошибка уникальности при обновлении ComponentService ID ${id}. Поле 'code' (${code}) должно быть уникальным.`
            )
          );
        }
      }
      return next(e); // Передаем другие ошибки дальше
    }
  }
);

// 📌 Удаление комплектующего/услуги (ComponentService)
// ИЗМЕНЕНО: deletePart -> deleteComponentService
export const deleteComponentService = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);

    try {
      // 1. Проверка существования ComponentService
      // ИЗМЕНЕНО: prisma.part -> prisma.componentService
      const componentExists = await prisma.componentService.findUnique({
        where: { id },
        select: { id: true, name: true }, // Используем поле 'name' для сообщения
      });
      if (!componentExists) {
        res.status(404);
        // ИЗМЕНЕНО: Сообщение об ошибке
        return next(new Error(`Комплектующее/услуга (ComponentService) с ID ${id} не найдено.`));
      }

      // 2. Проверка зависимостей (используется ли в CabinetComponent?)
      // ВАЖНО: В schema.prisma у поля CabinetComponent.component стоит onDelete: Restrict!
      // Это значит, что Prisma/база данных НЕ ДАСТ удалить запись, если есть связи.
      // Эта проверка нужна для более понятного сообщения пользователю ДО попытки удаления.
      const relatedComponentsCount = await prisma.cabinetComponent.count({
        // ИЗМЕНЕНО: where: { partId: id } -> where: { componentId: id }
        where: { componentId: id },
      });

      if (relatedComponentsCount > 0) {
        res.status(409); // Conflict
        // ИЗМЕНЕНО: Сообщение об ошибке, используем componentExists.name
        const message = `Невозможно удалить '${componentExists.name}' (ID ${id}), так как оно используется в ${relatedComponentsCount} кабинетах (в модели 'CabinetComponent'). Из-за правила 'Restrict' удаление запрещено.`;
        console.warn(message); // Логируем предупреждение
        return next(new Error(message)); // Возвращаем ошибку клиенту
      }

      // 3. Удаление (произойдет только если проверка выше пройдена)
      // ИЗМЕНЕНО: prisma.part.delete -> prisma.componentService.delete
      await prisma.componentService.delete({ where: { id } });
      res.status(200).json({ message: "Комплектующее/услуга успешно удалено" });

    } catch (e: any) {
      // ИЗМЕНЕНО: Логируем ошибку для ComponentService
      console.error(`Ошибка при удалении ComponentService ID ${id}:`, e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") { // RecordNotFound (маловероятно из-за проверки выше)
              res.status(404);
              // ИЗМЕНЕНО: Сообщение об ошибке
              return next(
                  new Error(
                      `Комплектующее/услуга (ComponentService) с ID ${id} не найдено (ошибка при удалении).`
                  )
              );
          } else if (e.code === "P2003") { // Foreign key constraint failed (явный результат onDelete: Restrict)
             res.status(409); // Conflict
             // Это сообщение может быть избыточным из-за явной проверки выше, но оставим на всякий случай
             return next(new Error(`Невозможно удалить ComponentService с ID ${id}, так как он используется в связанных записях (например, CabinetComponent).`));
          }
      }
      return next(e); // Передаем другие ошибки дальше
    }
  }
);