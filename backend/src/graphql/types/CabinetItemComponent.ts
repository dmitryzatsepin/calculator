// src/graphql/types/CabinetItemComponent.ts
import { builder } from '../builder';

// --- ИЗМЕНЕНО: Используем prismaObject вместо prismaNode ---
// Этот тип описывает связь между Cabinet и Item, включая количество
builder.prismaObject('CabinetItemComponent', {
  // Для prismaObject нам не нужно определять 'id' для Relay
  // Определяем поля, которые будут доступны
  fields: (t) => ({
    // Количество компонента
    quantity: t.exposeInt('quantity'),

    // Связь с самим объектом Item, чтобы получить его детали
    item: t.prismaField({
        type: 'Item', // Ссылка на GraphQL тип 'Item'
        // Резолвер для получения связанного Item по itemCode из текущего CabinetItemComponent
        resolve: (query, parent, args, ctx) =>
            // Используем findUniqueOrThrow, так как по схеме связь item обязательна (onDelete: Restrict)
            ctx.prisma.item.findUniqueOrThrow({
                 ...query, // Передаем информацию о запрашиваемых полях Item
                 where: { code: parent.itemCode } // Ищем Item по коду из родительского объекта (CabinetItemComponent)
             })
    }),

    // Можно также добавить поля cabinetCode и itemCode, если нужно их видеть явно
    // cabinetCode: t.exposeString('cabinetCode'),
    // itemCode: t.exposeString('itemCode'),

    // Обратная связь на Cabinet (если понадобится)
    // cabinet: t.prismaField({ ... })
  })
});
// --- КОНЕЦ ИЗМЕНЕНИЯ ---