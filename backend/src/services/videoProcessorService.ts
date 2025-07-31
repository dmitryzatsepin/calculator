// src/services/videoProcessorService.ts
import { PrismaClient, Prisma, VideoProcessor } from "@prisma/client";

export class VideoProcessorService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(query: Prisma.VideoProcessorFindManyArgs): Promise<VideoProcessor[]> {
        return this.prisma.videoProcessor.findMany({
            ...query,
            where: { active: true }, // По умолчанию отдаем только активные
            orderBy: { priceUsd: 'asc' } // Сортируем по цене, самые дешевые в начале
        });
    }
}