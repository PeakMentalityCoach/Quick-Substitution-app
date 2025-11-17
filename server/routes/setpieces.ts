import { Router } from 'express';
import {
  getSetPieces,
  getSetPieceById,
  createSetPiece,
  updateSetPiece,
  deleteSetPiece,
} from '../controllers/setpieces';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getSetPieces);
router.get('/:id', getSetPieceById);
router.post('/', createSetPiece);
router.patch('/:id', updateSetPiece);
router.delete('/:id', deleteSetPiece);

export default router;
