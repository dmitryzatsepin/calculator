import { useMemo } from 'react';

export interface Bitrix24Params {
    dealId: string;
    userId: string;
    domain: string;
    authId: string;
    memberId: string;
}

export const useBitrix24Params = (): Bitrix24Params | null => {
    return useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);

        const dealId = urlParams.get('dealId');
        const userId = urlParams.get('userId');
        const domain = urlParams.get('domain');
        const authId = urlParams.get('authId');
        const memberId = urlParams.get('memberId');

        // Проверяем наличие всех необходимых параметров
        if (dealId && userId && domain && authId && memberId) {
            return {
                dealId,
                userId,
                domain,
                authId,
                memberId
            };
        }

        return null;
    }, []);
}; 