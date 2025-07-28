import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, getMyTasks } from '../controllers/taskController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// GET: admin sees all, user sees own
router.get('/', getTasks);
router.get('/my', getMyTasks);

// POST: admin only
router.post('/', roleMiddleware('admin'), createTask);

// PUT: admin can update any, user can update own
router.put('/:id', updateTask);

// DELETE: admin only
router.delete('/:id', roleMiddleware('admin'), deleteTask);

export default router; 