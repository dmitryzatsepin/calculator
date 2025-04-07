
import express from 'express';

import { getAllPixelTypes /*, getPixelTypeById */ } from '../controllers/pixelTypeController'; 

const router = express.Router();


router.get('/', getAllPixelTypes); 


export default router; 