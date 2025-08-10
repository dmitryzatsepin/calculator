import { Bitrix24Params } from '../hooks/useBitrix24Params';

export interface CalculationData {
    techSpecs: any; // Тип для технических спецификаций
    costs: any;     // Тип для стоимости
}

export interface SmartProcessData {
    dealId: string;
    userId: string;
    calculationData: CalculationData;
}

export class Bitrix24Service {
    private static async makeRequest(
        domain: string,
        method: string,
        params: Record<string, any>
    ): Promise<any> {
        const url = `https://${domain}/rest/${method}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(`Bitrix24 API error: ${result.error_description || result.error}`);
            }

            return result.result;
        } catch (error) {
            console.error('Bitrix24 API request failed:', error);
            throw error;
        }
    }

    /**
     * Создает смарт-процесс с привязкой к сделке
     */
    static async createSmartProcess(
        params: Bitrix24Params,
        calculationData: CalculationData
    ): Promise<any> {
        const { domain, authId, dealId, userId } = params;

        // Создаем смарт-процесс типа "Расчет LED экрана"
        const smartProcessData = {
            auth: authId,
            entityTypeId: 'DYNAMIC_1', // ID типа смарт-процесса (нужно настроить в Битрикс24)
            fields: {
                'TITLE': `Расчет LED экрана для сделки ${dealId}`,
                'DEAL_ID': dealId,
                'ASSIGNED_BY_ID': userId,
                'STAGE_ID': 'DT1_NEW', // ID стадии "Новый"
                'UF_CRM_DEAL': dealId, // Привязка к сделке
                'UF_CALCULATION_DATA': JSON.stringify(calculationData), // Данные расчета
                'UF_SCREEN_TYPE': calculationData.techSpecs?.screenType || 'Не указан',
                'UF_SCREEN_SIZE': `${calculationData.techSpecs?.actualScreenWidthM || 0} x ${calculationData.techSpecs?.actualScreenHeightM || 0} м`,
                'UF_TOTAL_COST': calculationData.costs?.totalCost || 0,
                'UF_CURRENCY': 'RUB',
            }
        };

        try {
            const result = await this.makeRequest(domain, 'crm.item.add', smartProcessData);
            console.log('Смарт-процесс создан:', result);
            return result;
        } catch (error) {
            console.error('Ошибка создания смарт-процесса:', error);
            throw error;
        }
    }

    /**
     * Обновляет сделку информацией о расчете
     */
    static async updateDeal(
        params: Bitrix24Params,
        calculationData: CalculationData
    ): Promise<any> {
        const { domain, authId, dealId } = params;

        const dealUpdateData = {
            auth: authId,
            id: dealId,
            fields: {
                'UF_CRM_DEAL_LED_CALCULATION': JSON.stringify(calculationData),
                'UF_CRM_DEAL_LED_SCREEN_SIZE': `${calculationData.techSpecs?.actualScreenWidthM || 0} x ${calculationData.techSpecs?.actualScreenHeightM || 0} м`,
                'UF_CRM_DEAL_LED_TOTAL_COST': calculationData.costs?.totalCost || 0,
            }
        };

        try {
            const result = await this.makeRequest(domain, 'crm.deal.update', dealUpdateData);
            console.log('Сделка обновлена:', result);
            return result;
        } catch (error) {
            console.error('Ошибка обновления сделки:', error);
            throw error;
        }
    }

    /**
     * Отправляет данные расчета в Битрикс24
     */
    static async sendCalculationData(
        params: Bitrix24Params,
        calculationData: CalculationData
    ): Promise<any> {
        try {
            // Создаем смарт-процесс
            const smartProcessResult = await this.createSmartProcess(params, calculationData);

            // Обновляем сделку
            const dealUpdateResult = await this.updateDeal(params, calculationData);

            return {
                smartProcess: smartProcessResult,
                dealUpdate: dealUpdateResult
            };
        } catch (error) {
            console.error('Ошибка отправки данных в Битрикс24:', error);
            throw error;
        }
    }
} 