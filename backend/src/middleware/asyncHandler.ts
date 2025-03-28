import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Обертка для асинхронных обработчиков маршрутов Express.
 * Перехватывает ошибки из промисов и передает их в Express-обработчик ошибок
 * с помощью next(error). Это позволяет избежать написания try/catch
 * в каждом асинхронном контроллере.
 *
 * @param fn Асинхронная функция-обработчик маршрута
 * @returns Стандартный обработчик маршрута Express
 */
export const asyncHandler = (fn: AsyncRequestHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        // Выполняем асинхронную функцию и ловим возможные ошибки
        Promise.resolve(fn(req, res, next))
               .catch(next); // Передаем любую ошибку дальше в цепочку middleware (к errorHandler)
    };