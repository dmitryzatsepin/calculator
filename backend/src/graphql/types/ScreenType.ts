// backend/src/graphql/types/ScreenType.ts
import { builder } from '../builder';
import { OptionService } from '../../services/optionService';
import { ControlTypeService } from '../../services/controlTypeService';
import { SensorService } from '../../services/sensorService';

const getOptionService = (ctx: any) => new OptionService(ctx.prisma);
const getControlTypeService = (ctx: any) => new ControlTypeService(ctx.prisma);
const getSensorService = (ctx: any) => new SensorService(ctx.prisma);

builder.prismaNode('ScreenType', {
    id: { field: 'id' },
    fields: (t) => ({
        // Простые поля
        code: t.exposeString('code'),
        name: t.exposeString('name'),
        active: t.exposeBoolean('active'),
        createdAt: t.expose('createdAt', { type: 'DateTime' }),
        updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

        // --- Связи, делегированные сервисам ---
        options: t.prismaField({
            type: ['Option'],
            resolve: (query, parent, _args, ctx) => getOptionService(ctx).findByScreenTypeCode(query, parent.code)
        }),

        controlTypes: t.prismaField({
            type: ['ControlType'],
            resolve: (query, parent, _args, ctx) => getControlTypeService(ctx).findByScreenTypeCode(query, parent.code)
        }),

        sensors: t.prismaField({
            type: ['Sensor'],
            resolve: (query, parent, _args, ctx) => getSensorService(ctx).findByScreenTypeCode(query, parent.code)
        }),
    }),
});