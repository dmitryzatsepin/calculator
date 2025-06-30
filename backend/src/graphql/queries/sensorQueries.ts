// backend/src/graphql/queries/sensorQueries.ts
import { builder } from '../builder';
import { SensorService } from '../../services/sensorService';

const getSensorService = (ctx: any) => new SensorService(ctx.prisma);

builder.queryFields((t) => ({
  sensors: t.prismaField({
    type: ['Sensor'],
    description: 'Получить список всех доступных сенсоров.',
    args: {
      onlyActive: t.arg.boolean({
        required: false,
        defaultValue: true,
        description: 'Вернуть только активные сенсоры?',
      }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getSensorService(ctx).findAll(query, { onlyActive: args.onlyActive });
    },
  }),
}));