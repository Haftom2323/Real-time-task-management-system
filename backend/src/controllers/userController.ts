import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUserService(req.body);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create user' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsersService();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserByIdService(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await userService.updateUserService(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.deleteUserService(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete user' });
  }
};