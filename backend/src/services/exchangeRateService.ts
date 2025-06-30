// backend/src/services/exchangeRateService.ts
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const CBRF_URL = 'http://www.cbr.ru/scripts/XML_daily.asp';
const USD_CURRENCY_ID = 'R01235';
const MAX_LOOKBACK_DAYS = 7;
const REQUEST_TIMEOUT = 5000;

interface CbrfValute {
  '@_ID': string;
  NumCode: number;
  CharCode: string;
  Nominal: number;
  Name: string;
  Value: string;
}

export class ExchangeRateService {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
    });
  }

  /**
   * Получает и парсит курс для конкретной даты.
   * @param date - Объект dayjs с нужной датой.
   * @returns Промис, который разрешается в число (курс) или null, если курс не найден.
   */
  private async fetchRateForDate(date: dayjs.Dayjs): Promise<number | null> {
    const dateString = date.format('DD/MM/YYYY');
    const url = `${CBRF_URL}?date_req=${dateString}`;
    // console.log(`[ExchangeRateService] Fetching rate for date: ${dateString}`);

    try {
      const response = await axios.get(url, {
        timeout: REQUEST_TIMEOUT,
      });

      const parsedData = this.parser.parse(response.data);
      const valuteList: CbrfValute[] = parsedData?.ValCurs?.Valute;

      if (!Array.isArray(valuteList)) {
        console.warn(`[ExchangeRateService] No Valute array found for date ${dateString}`);
        return null;
      }

      const usdValute = valuteList.find((v) => v?.['@_ID'] === USD_CURRENCY_ID);

      if (usdValute?.Value) {
        const rateString = String(usdValute.Value).replace(',', '.');
        const rate = parseFloat(rateString);
        if (!isNaN(rate)) {
          console.log(`[ExchangeRateService] Found USD rate for ${dateString}: ${rate}`);
          return rate;
        }
      }
    } catch (error: any) {
      console.error(`[ExchangeRateService] Error fetching rate for date ${dateString}:`, error.message);
    }

    return null;
  }

  /**
   * Получает последний доступный курс доллара, просматривая до N дней назад.
   * @returns Промис, который разрешается в число (курс) или null, если курс не найден.
   */
  public async getLatestUSDRate(): Promise<number | null> {
    console.log(`[ExchangeRateService] Getting latest USD rate (looking back ${MAX_LOOKBACK_DAYS} days)`);
    let currentDate = dayjs();
    for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
      const rate = await this.fetchRateForDate(currentDate);
      if (rate !== null) {
        return rate;
      }
      // Если на сегодня курса нет (выходной), ищем на вчера
      currentDate = currentDate.subtract(1, 'day');
    }
    console.warn(`[ExchangeRateService] Could not find USD rate in the last ${MAX_LOOKBACK_DAYS} days.`);
    return null;
  }
}