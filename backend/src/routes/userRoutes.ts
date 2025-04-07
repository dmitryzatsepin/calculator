
import express from 'express';
import { protect } from '../middleware/authMiddleware';

import { getAllUsers } from '../controllers/dataController';

const router = express.Router();


router.get('/', protect, getAllUsers);

// Сюда можно будет добавить другие маршруты для пользователей, если понадобятся
// Например: router.get('/:id', protect, getUserById);
// Например: router.post('/', protect, admin, createUser); // Только админ создает

export default router;