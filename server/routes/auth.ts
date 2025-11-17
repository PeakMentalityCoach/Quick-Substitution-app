import { Router } from 'express';
import {
  requestMagicLink,
  verifyMagicLink,
  loginWithAdminCode,
  getCurrentUser,
  updateProfile,
} from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/request-magic-link', requestMagicLink);
router.post('/verify-magic-link', verifyMagicLink);
router.post('/login-admin', loginWithAdminCode);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateProfile);

export default router;
