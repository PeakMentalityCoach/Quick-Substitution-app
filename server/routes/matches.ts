import { Router } from 'express';
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
} from '../controllers/matches';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getMatches);
router.get('/:id', getMatchById);
router.post('/', createMatch);
router.patch('/:id', updateMatch);
router.delete('/:id', deleteMatch);

export default router;
