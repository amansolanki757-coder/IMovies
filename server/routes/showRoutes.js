import express from 'express';
import {
  getShows,
  getShowById,
  createShow,
  deleteShow,
} from '../controllers/showController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getShows)
  .post(protect, adminOnly, createShow);

router.route('/:id')
  .get(getShowById)
  .delete(protect, adminOnly, deleteShow);

export default router;

