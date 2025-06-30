// backend/src/graphql/queries/exchangeRateQueries.ts
import { builder } from '../builder';
import { ExchangeRateService } from '../../services/exchangeRateService';

// Вспомогательная функция для создания экземпляра сервиса
// Поскольку сервис не зависит от контекста (prisma), его можно создать один раз
const exchangeRateService = new ExchangeRateService();

builder.queryFields((t) => ({
  getCurrentDollarRate: t.field({
    type: 'Float',
    nullable: true,
    description: 'Получить текущий курс доллара США от ЦБ РФ. Ищет последний доступный курс за последние 7 дней.',
    resolve: async () => {
      return exchangeRateService.getLatestUSDRate();
    }
  })
}));