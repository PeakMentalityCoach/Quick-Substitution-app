import { Router } from 'express';
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/players';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getPlayers);
router.get('/:id', getPlayerById);
router.post('/', createPlayer);
router.patch('/:id', updatePlayer);
router.delete('/:id', deletePlayer);

export default router;
