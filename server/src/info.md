// Перезапустить seed.ts для пересоздания данных.
pnpm prisma db seed

//Проверить базу
pnpm prisma studio

//Создать миграцию
pnpm prisma migrate dev --name {имя_изменения}

//Если база уже развернута и нужно просто применить изменения:
pnpm prisma migrate deploy

//После миграции Prisma может требовать обновления клиентской библиотеки:
pnpm prisma generate
