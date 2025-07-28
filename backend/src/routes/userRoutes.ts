import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', roleMiddleware('admin'), getAllUsers);

export default router; 