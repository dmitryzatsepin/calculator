// src/graphql/queries/exchangeRateQueries.ts
import { builder } from '../builder';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser'; // Используем XMLParser
import dayjs from 'dayjs'; // Используем dayjs для удобной работы с датами
import customParseFormat from 'dayjs/plugin/customParseFormat'; // Плагин для парсинга формата

dayjs.extend(customParseFormat); // Расширяем dayjs

const CBRF_URL = 'http://www.cbr.ru/scripts/XML_daily.asp';
const USD_CURRENCY_ID = 'R01235'; // ID доллара США в API ЦБ РФ
const MAX_LOOKBACK_DAYS = 7; // Максимум дней назад для поиска курса

// --- Функция для получения и парсинга курса ---
async function fetchRateForDate(date: dayjs.Dayjs): Promise<number | null> {
  const dateString = date.format('DD/MM/YYYY');
  const url = `${CBRF_URL}?date_req=${dateString}`;
  console.log(`[fetchRateForDate] Fetching rate for date: ${dateString} from ${url}`);

  try {
    const response = await axios.get(url, {
        // Добавляем таймаут и обработку ошибок
        timeout: 5000, // 5 секунд таймаут
        validateStatus: (status) => status >= 200 && status < 300, // Считаем успехом только 2xx
     });

    // Парсим XML
    const parser = new XMLParser({
      ignoreAttributes: false, // Нам нужны атрибуты (ID валюты)
      attributeNamePrefix: "@_", // Префикс для атрибутов
      parseAttributeValue: true, // Пытаться парсить значения атрибутов
      //parseNodeValue: true,     // Пытаться парсить значения тегов
    });
    const parsedData = parser.parse(response.data);

    // Ищем нужную валюту
    const valuteList = parsedData?.ValCurs?.Valute;
    if (!Array.isArray(valuteList)) {
        console.warn(`[fetchRateForDate] Invalid XML structure or no Valute array found for date ${dateString}`);
        return null;
    }

    const usdValute = valuteList.find((v: any) => v?.['@_ID'] === USD_CURRENCY_ID);

    if (usdValute && usdValute.Value) {
      // Значение приходит как строка с запятой, заменяем на точку и парсим
      const rateString = String(usdValute.Value).replace(',', '.');
      const rate = parseFloat(rateString);
      if (!isNaN(rate)) {
        console.log(`[fetchRateForDate] Found USD rate for ${dateString}: ${rate}`);
        return rate;
      } else {
         console.warn(`[fetchRateForDate] Could not parse rate value "${usdValute.Value}" for date ${dateString}`);
      }
    } else {
        console.log(`[fetchRateForDate] USD rate not found for date ${dateString}`);
    }
  } catch (error: any) {
    // Логируем ошибки HTTP-запроса или парсинга
    console.error(`[fetchRateForDate] Error fetching or parsing rate for date ${dateString}:`, error.message || error);
  }

  return null; // Возвращаем null, если курс не найден или произошла ошибка
}


// --- Определяем GraphQL запрос ---
builder.queryFields((t) => ({
  getCurrentDollarRate: t.field({
    type: 'Float', // Возвращаем число с плавающей точкой
    nullable: true, // Может вернуть null, если не удалось получить курс
    description: 'Получить текущий курс доллара США от ЦБ РФ (с поиском предыдущего рабочего дня).',
    resolve: async () => {
      let currentDate = dayjs(); // Начинаем с сегодняшнего дня
      for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
        const rate = await fetchRateForDate(currentDate);
        if (rate !== null) {
          return rate; // Возвращаем первый найденный курс
        }
        // Если курс не найден, пробуем предыдущий день
        currentDate = currentDate.subtract(1, 'day');
        console.log(`[getCurrentDollarRate] Rate not found, trying previous day: ${currentDate.format('DD/MM/YYYY')}`);
      }

      // Если за MAX_LOOKBACK_DAYS курс не найден
      console.error(`[getCurrentDollarRate] Could not find USD rate within the last ${MAX_LOOKBACK_DAYS} days.`);
      return null;
    }
  })
}));