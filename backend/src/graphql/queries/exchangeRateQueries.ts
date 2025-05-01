// src/graphql/queries/exchangeRateQueries.ts
import { builder } from '../builder';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const CBRF_URL = 'http://www.cbr.ru/scripts/XML_daily.asp';
const USD_CURRENCY_ID = 'R01235'; // ID доллара США в API ЦБ РФ
const MAX_LOOKBACK_DAYS = 7;

// --- Функция для получения и парсинга курса ---
async function fetchRateForDate(date: dayjs.Dayjs): Promise<number | null> {
  const dateString = date.format('DD/MM/YYYY');
  const url = `${CBRF_URL}?date_req=${dateString}`;
  console.log(`[fetchRateForDate] Fetching rate for date: ${dateString} from ${url}`);

  try {
    const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300,
     });

    // Парсим XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
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
    console.error(`[fetchRateForDate] Error fetching or parsing rate for date ${dateString}:`, error.message || error);
  }

  return null;
}

// --- Определяем GraphQL запрос ---
builder.queryFields((t) => ({
  getCurrentDollarRate: t.field({
    type: 'Float',
    nullable: true,
    description: 'Получить текущий курс доллара США от ЦБ РФ',
    resolve: async () => {
      let currentDate = dayjs();
      for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
        const rate = await fetchRateForDate(currentDate);
        if (rate !== null) return rate;
        currentDate = currentDate.subtract(1, 'day');
      }
      return null;
    }
  })
}));