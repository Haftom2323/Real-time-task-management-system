import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const roleMiddleware = (role: 'admin' | 'user') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}; 