// backend/src/graphql/queries/ipProtectionQueries.ts
import { builder } from '../builder';
import { IpProtectionService } from '../../services/ipProtectionService';

const getIpProtectionService = (ctx: any) => new IpProtectionService(ctx.prisma);

builder.queryFields((t) => ({
  // Запрос на получение списка степеней защиты
  ipProtections: t.prismaField({
    type: ['IpProtection'],
    description: 'Получить список всех степеней IP-защиты.',
    args: {
      onlyActive: t.arg.boolean({
        defaultValue: true,
        description: 'Вернуть только активные записи?',
      }),
    },
    resolve: (_query, _parent, args, ctx) => {
      return getIpProtectionService(ctx).findAll({ onlyActive: args.onlyActive });
    },
  }),

  // Запрос на получение одной степени защиты по коду
  ipProtectionByCode: t.prismaField({
    type: 'IpProtection',
    nullable: true,
    description: 'Получить одну степень IP-защиты по ее коду.',
    args: {
      code: t.arg.string({ required: true, description: 'Уникальный код IP-защиты (например, IP65)' }),
    },
    resolve: (_query, _parent, args, ctx) => {
      return getIpProtectionService(ctx).findByCode(args.code);
    },
  }),
}));