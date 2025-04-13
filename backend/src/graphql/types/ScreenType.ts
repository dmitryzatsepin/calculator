import { builder } from '../builder';

builder.prismaNode('ScreenType', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    name: t.exposeString('name'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // --- Связи M-N через промежуточные таблицы ---
    // Получаем связанные Option
    options: t.prismaField({
        type: ['Option'],
        resolve: async (query, parent, args, ctx) => {
            const screenTypeOptions = await ctx.prisma.screenTypeOption.findMany({
                where: { screenTypeCode: parent.code },
                select: { optionCode: true }
            });
            return ctx.prisma.option.findMany({
                ...query,
                where: { code: { in: screenTypeOptions.map(sto => sto.optionCode) } }
            });
        }
    }),
     // Получаем связанные ControlType
    controlTypes: t.prismaField({
        type: ['ControlType'],
        resolve: async (query, parent, args, ctx) => {
            const screenTypeControlTypes = await ctx.prisma.screenTypeControlType.findMany({
                where: { screenTypeCode: parent.code },
                select: { controlTypeCode: true }
            });
            return ctx.prisma.controlType.findMany({
                ...query,
                where: { code: { in: screenTypeControlTypes.map(stct => stct.controlTypeCode) } }
            });
        }
    }),
     // Получаем связанные Sensor
    sensors: t.prismaField({
        type: ['Sensor'],
        resolve: async (query, parent, args, ctx) => {
            const screenTypeSensors = await ctx.prisma.screenTypeSensor.findMany({
                where: { screenTypeCode: parent.code },
                select: { sensorCode: true }
            });
            return ctx.prisma.sensor.findMany({
                ...query,
                where: { code: { in: screenTypeSensors.map(sts => sts.sensorCode) } }
            });
        }
    }),
  }),
});