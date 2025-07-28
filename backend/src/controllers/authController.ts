import { Request, Response } from 'express';
import { loginService, registerService } from '../services/authService';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await loginService(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const user = await registerService(name, email, password);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Registration failed' });
  }
}; 