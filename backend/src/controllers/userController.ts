import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, 'name email role'); 
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}; 