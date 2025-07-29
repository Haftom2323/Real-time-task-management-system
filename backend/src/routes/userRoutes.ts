import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Admin-only routes
router.get('/', roleMiddleware('admin'), getAllUsers);
router.get('/:id', roleMiddleware('admin'), getUserById);
router.put('/:id', roleMiddleware('admin'), updateUser);
router.delete('/:id', roleMiddleware('admin'), deleteUser);

// User-specific routes (users can view/update their own profile)
router.get('/profile/me', (req, res) => {
  // Redirect to the current user's profile
  res.redirect(`/api/users/${(req as any).user.userId}`);
});

export default router;