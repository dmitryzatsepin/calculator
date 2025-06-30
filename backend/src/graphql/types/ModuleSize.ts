// backend/src/graphql/types/ModuleSize.ts
import { builder } from '../builder';
import { ModuleService } from '../../services/moduleService';
import { CabinetSizeService } from '../../services/cabinetSizeService';

const getModuleService = (ctx: any) => new ModuleService(ctx.prisma);
const getCabinetSizeService = (ctx: any) => new CabinetSizeService(ctx.prisma);

builder.prismaNode('ModuleSize', {
    id: { field: 'id' },
    fields: (t) => ({
        // Простые поля
        code: t.exposeString('code'),
        size: t.exposeString('size'),
        width: t.exposeInt('width'),
        height: t.exposeInt('height'),
        active: t.exposeBoolean('active'),
        createdAt: t.expose('createdAt', { type: 'DateTime' }),
        updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

        // Связь с модулями этого размера
        modules: t.prismaField({
            type: ['Module'],
            description: "Модули, имеющие данный размер.",
            args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
            resolve: (query, parent, args, ctx) => {
                return getModuleService(ctx).findByModuleSizeCode(
                    query,
                    parent.code,
                    args.onlyActive ?? null
                );
            },
        }),

        // Связь с совместимыми размерами кабинетов
        compatibleCabinetSizes: t.prismaField({
            type: ['CabinetSize'],
            description: "Размеры кабинетов, совместимые с данным размером модуля.",
            args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
            resolve: (query, parent, args, ctx) => {
                return getCabinetSizeService(ctx).findCompatibleByModuleSizeCode(
                    query,
                    parent.code,
                    args.onlyActive ?? null
                );
            },
        }),
    }),
});