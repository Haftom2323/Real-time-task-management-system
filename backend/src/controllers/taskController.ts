import { Request, Response } from 'express';
import { getTasksService, createTaskService, updateTaskService, deleteTaskService, getMyTasksService } from '../services/taskService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await getTasksService(req.user!.userId, req.user!.role);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo } = req.body;
    const task = await createTaskService({
      title,
      description,
      status: 'pending',
      createdBy: req.user!.userId,
      assignedTo
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const task = await updateTaskService(id, req.user!.userId, req.user!.role, update);
    if (!task) return res.status(404).json({ message: 'Task not found or not permitted' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await deleteTaskService(id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await getMyTasksService(req.user!.userId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user tasks' });
  }
}; 