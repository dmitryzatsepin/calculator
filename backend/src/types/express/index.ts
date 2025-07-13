// src/types/express/index.ts

export interface CustomUser {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN';
}