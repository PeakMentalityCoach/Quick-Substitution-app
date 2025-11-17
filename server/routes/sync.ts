import { Router } from 'express';
import { sync } from '../controllers/sync';
import { authenticate } from '../middleware/auth';

const router = Router();

// Sync endpoint requires authentication
router.post('/', authenticate, sync);

export default router;
