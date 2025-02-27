import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Заполняем базу данных...');

  // Полностью очищаем таблицы перед вставкой новых данных
  await prisma.screenType.deleteMany({});
  await prisma.pixelStep.deleteMany({});
  await prisma.cabinet.deleteMany({});

  // Данные для типов экрана
  const screenTypeData = [
    { type: 'outdoor', name: 'уличный', screenOption: ["монолит"] },
    { type: 'indoor', name: 'интерьерный', screenOption: ["монолит", "гибкий экран"] },
  ];

  console.log("Будет загружено:", screenTypeData.length, "записей в ScreenType");

  await prisma.screenType.createMany({
    data: screenTypeData,
    skipDuplicates: true,
  });


  // Данные для шагов пикселя
  const pixelData = [
    { type: 'indoor', name: 'P5', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P5 Pro', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P4', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P4 Pro', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P3.91', width: 250, height: 250, option: "standard" },
    { type: 'indoor', name: 'P3.91 Pro', width: 250, height: 250, option: "standard" },
    { type: 'indoor', name: 'P3.07', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P3.07 Pro', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P3', width: 192, height: 192, option: "standard" },
    { type: 'indoor', name: 'P3 Pro', width: 192, height: 192, option: "standard" },
    { type: 'indoor', name: 'P2.97 Pro', width: 250, height: 250, option: "standard" },
    { type: 'indoor', name: 'P2.6 Pro', width: 250, height: 250, option: "standard" },
    { type: 'indoor', name: 'P2.5', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P2.5 Pro', width: 160, height: 320, option: "flexible" },
    { type: 'indoor', name: 'P2', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P2 Pro', width: 160, height: 320, option: "flexible" },
    { type: 'indoor', name: 'P1.86', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P1.86 Pro', width: 160, height: 320, option: "flexible" },
    { type: 'indoor', name: 'P1.66 Pro', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P1.53 Pro', width: 160, height: 320, option: "flexible" },
    { type: 'indoor', name: 'P1.37 Pro', width: 160, height: 320, option: "standard" },
    { type: 'indoor', name: 'P1.25 Pro', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P8', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P8 Pro', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P6.66', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P6.66 Pro', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P6', width: 192, height: 192, option: "standard" },
    { type: 'outdoor', name: 'P5', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P5 Pro', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P4.81 Pro', width: 250, height: 250, option: "standard" },
    { type: 'outdoor', name: 'P4', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P4 Pro', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P3.91 Pro', width: 250, height: 250, option: "standard" },
    { type: 'outdoor', name: 'P3.07', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P3.07 Pro', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P2.5 Pro', width: 160, height: 320, option: "standard" },
    { type: 'outdoor', name: 'P3 Pro', width: 192, height: 192, option: "standard" },
    { type: 'outdoor', name: 'P2.97 Pro', width: 250, height: 250, option: "standard" },
  ];

  console.log("Будет загружено:", pixelData.length, "записей в PixelOption");

  await prisma.pixelStep.createMany({
    data: pixelData,
    skipDuplicates: true,
  });

  // Данные для кабинетов
  const cabinetData = [
    {
      name: '960×960 AL задний уличный',
      type: 'outdoor',
      width: 960,
      height: 960,
      modulesQ: 18,
      powerUnitCapacity: 300,
      powerUnitQ: 3,
      receiver: 2,
      cooler: 2,
      pixelOption: ['P8', 'P8 Pro', 'P6.66', 'P6.66 Pro', 'P5', 'P5 Pro', 'P4', 'P4 Pro', 'P3.07', 'P3.07 Pro', 'P2.5 Pro'],
    },
    {
      name: '640×640 AL задний уличный',
      type: 'outdoor',
      width: 640,
      height: 640,
      modulesQ: 8,
      powerUnitCapacity: 200,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 1,
      pixelOption: ['P8', 'P8 Pro', 'P6.66', 'P6.66 Pro', 'P5', 'P5 Pro', 'P4', 'P4 Pro', 'P3.07', 'P3.07 Pro', 'P2.5 Pro'],
    },
    {
      name: '576×576 AL задний уличный',
      type: 'outdoor',
      width: 576,
      height: 576,
      modulesQ: 9,
      powerUnitCapacity: 200,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 1,
      pixelOption: ['P3 Pro', 'P6'],
    },
    {
      name: '960×960 AL задний интерьерный',
      type: 'indoor',
      width: 960,
      height: 960,
      modulesQ: 18,
      powerUnitCapacity: 200,
      powerUnitQ: 3,
      receiver: 2,
      cooler: 0,
      pixelOption: ['P5', 'P5 Pro', 'P4', 'P4 Pro', 'P3.07', 'P3.07 Pro', 'P2.5', 'P2.5 Pro', 'P2'],
    },
    {
      name: '640×640 AL задний интерьерный',
      type: 'indoor',
      width: 640,
      height: 640,
      modulesQ: 8,
      powerUnitCapacity: 200,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P5', 'P5 Pro', 'P4', 'P4 Pro', 'P3.07', 'P3.07 Pro', 'P2.5', 'P2.5 Pro', 'P2', 'P2 Pro'],
    },
    {
      name: '576×576 AL задний интерьерный',
      type: 'indoor',
      width: 576,
      height: 576,
      modulesQ: 9,
      powerUnitCapacity: 200,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P3', 'P3 Pro'],
    },
    {
      name: '500×500 AL фронтальный интерьерный',
      type: 'indoor',
      width: 500,
      height: 500,
      modulesQ: 4,
      powerUnitCapacity: 200,
      powerUnitQ: 1,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P2.6 Pro', 'P3.91', 'P3.91 Pro', 'P2.97 Pro'],
    },
    {
      name: '500×500 AL задний интерьерный',
      type: 'indoor',
      width: 500,
      height: 500,
      modulesQ: 4,
      powerUnitCapacity: 200,
      powerUnitQ: 1,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P2.6 Pro', 'P3.91', 'P3.91 Pro', 'P2.97 Pro'],
    },
    {
      name: '500×500 AL задний уличный',
      type: 'outdoor',
      width: 500,
      height: 500,
      modulesQ: 4,
      powerUnitCapacity: 200,
      powerUnitQ: 1,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P3.91 Pro', 'P4.81 Pro', 'Р2.97 Pro'],
    },
    {
      name: '500×1000 AL задний уличный',
      type: 'outdoor',
      width: 500,
      height: 1000,
      modulesQ: 8,
      powerUnitCapacity: 300,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P3.91 Pro', 'P4.81 Pro', 'Р2.97 Pro'],
    },
    {
      name: '500×1000 AL задний интерьерный',
      type: 'indoor',
      width: 500,
      height: 1000,
      modulesQ: 8,
      powerUnitCapacity: 200,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P2.6 Pro', 'P3.91', 'P3.91 Pro', 'P2.97 Pro'],
    },
    {
      name: '500×1000 AL фронтальный интерьерный',
      type: 'indoor',
      width: 500,
      height: 1000,
      modulesQ: 8,
      powerUnitCapacity: 200,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P2.6 Pro', 'P3.91', 'P3.91 Pro', 'P2.97 Pro'],
    },
    {
      name: '640×640 C_AL фронтальный интерьерный',
      type: 'indoor',
      width: 640,
      height: 640,
      modulesQ: 8,
      powerUnitCapacity: 200,
      powerUnitQ: 2,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P4', 'P4 Pro', 'P3.07', 'P3.07 Pro', 'P2.5', 'P2.5 Pro', 'P2', 'P1.86', 'P1.86 Pro'],
    },
    {
      name: '480×640 C_AL фронтальный интерьерный (шаг пикселя до 1.86)',
      type: 'indoor',
      width: 480,
      height: 640,
      modulesQ: 6,
      powerUnitCapacity: 200,
      powerUnitQ: 1,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P4', 'P4 Pro', 'P3.07', 'P3.07 Pro', 'P2.5', 'P2.5 Pro', 'P2', 'P1.86', 'P1.86 Pro'],
    },
    {
      name: '480×640 C_AL фронтальный интерьерный (шаг пикселя ниже 1.86)',
      type: 'indoor',
      width: 480,
      height: 640,
      modulesQ: 6,
      powerUnitCapacity: 300,
      powerUnitQ: 1,
      receiver: 1,
      cooler: 0,
      pixelOption: ['P1.66 Pro', 'P1.53 Pro', 'P1.37 Pro', 'P1.25 Pro'],
    },
  ];
  

  console.log("Будет загружено:", cabinetData.length, "записей в Cabinet");

  await prisma.cabinet.createMany({
    data: cabinetData,
    skipDuplicates: true,
  });

  console.log('✅ Данные успешно загружены!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы:', e);
    console.error(e);
    globalThis.process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
