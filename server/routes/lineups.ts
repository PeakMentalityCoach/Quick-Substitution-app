import { Router } from 'express';
import {
  getLineupsByMatch,
  createLineup,
  updateLineup,
  createSubstitution,
  getSubstitutionsByMatch,
  deleteSubstitution,
} from '../controllers/lineups';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Lineup routes
router.get('/match/:matchId', getLineupsByMatch);
router.post('/', createLineup);
router.patch('/:id', updateLineup);

// Substitution routes
router.get('/substitutions/match/:matchId', getSubstitutionsByMatch);
router.post('/substitutions', createSubstitution);
router.delete('/substitutions/:id', deleteSubstitution);

export default router;
