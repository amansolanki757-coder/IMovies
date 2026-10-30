import express from 'express';
import { getShowSeats, lockSeats, releaseSeats } from '../controllers/seatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/show/:showId', getShowSeats);
router.post('/lock', protect, lockSeats);
router.post('/release', protect, releaseSeats);

export default router;
