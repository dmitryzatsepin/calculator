// src/graphql/queries/ipProtectionQueries.ts
import { builder } from '../builder';

builder.queryFields((t) => ({
  ipProtections: t.prismaField({
    type: ['IpProtection'],
    description: 'Получить список всех степеней IP-защиты.',
    args: {
        onlyActive: t.arg.boolean({
            defaultValue: true,
            description: 'Вернуть только активные записи?'
        })
    },
    resolve: async (query, _parent, args, ctx) => {
      console.log(`[ipProtections] Fetching IP Protections. onlyActive: ${args.onlyActive}`);
      return ctx.prisma.ipProtection.findMany({
         ...query,
         where: { active: args.onlyActive ?? undefined },
         orderBy: { code: 'asc' }
      });
    }
  }),

  // --- Получить одну степень защиты по коду ---
  ipProtectionByCode: t.prismaField({
    type: 'IpProtection',
    nullable: true,
    description: 'Получить одну степень IP-защиты по ее коду.',
    args: {
        code: t.arg.string({ required: true, description: 'Уникальный код IP-защиты (например, IP65)' })
    },
    resolve: async (query, _parent, args, ctx) => {
        console.log(`[ipProtectionByCode] Searching for code: ${args.code}`);
        const codeArg = args.code;
        if (typeof codeArg !== 'string') {
             console.error("Invalid code argument type received:", typeof codeArg);
             throw new Error("Invalid argument: code must be a string.");
        }
        return ctx.prisma.ipProtection.findUnique({
            ...query,
            where: { code: codeArg }
        });
    }
  })

}));