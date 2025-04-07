import express from 'express';
import {
    getManufacturers,
    getManufacturerById,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
} from '../controllers/manufacturerController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// --- Маршруты для Производителей (Manufacturers) ---

router.route('/')
    .get(getManufacturers)
    .post(protect, admin, createManufacturer);

router.route('/:id')
    .get(getManufacturerById)
    .put(protect, admin, updateManufacturer)
    .delete(protect, admin, deleteManufacturer);

export default router;