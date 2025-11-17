import { Router } from 'express';
import {
  getNotesByMatch,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notes';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/match/:matchId', getNotesByMatch);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
