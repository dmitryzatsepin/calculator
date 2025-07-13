// src/graphql/types/CabinetCabinetSize.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';

// 1. Определяем тип с включенными отношениями
type CabinetCabinetSize = Prisma.CabinetCabinetSizeGetPayload<{
  include: {
    cabinet: true;
    size: true;
  };
}>;

// 2. Определяем тип для field builder
type FieldBuilder = Parameters<
  Parameters<typeof builder.prismaObject>[1]['fields']
>[0];

builder.prismaObject('CabinetCabinetSize', {
  fields: (t: FieldBuilder) => ({
    // 3. Основные поля
    cabinetCode: t.exposeString('cabinetCode'),
    cabinetSizeCode: t.exposeString('cabinetSizeCode'),

    // 4. Реляции
    cabinet: t.relation('cabinet'),
    size: t.relation('size'),
  }),
});