import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getMovies)
  .post(protect, adminOnly, upload.single('poster'), createMovie);

router.route('/:id')
  .get(getMovieById)
  .put(protect, adminOnly, upload.single('poster'), updateMovie)
  .delete(protect, adminOnly, deleteMovie);

export default router;

