import Task from '../models/Task';
import { Types } from 'mongoose';

export const getTasksService = async (userId: string, role: string) => {
  if (role === 'admin') {
    return Task.find().populate('createdBy assignedTo', 'name email');
  } else {
    return Task.find({ assignedTo: userId }).populate('createdBy assignedTo', 'name email');
  }
};

export const createTaskService = async (data: any) => {
  return Task.create(data);
};

export const updateTaskService = async (taskId: string, userId: string, role: string, update: any) => {
  if (role === 'admin') {
    return Task.findByIdAndUpdate(taskId, update, { new: true });
  } else {
    // User can only update their own assigned tasks
    return Task.findOneAndUpdate({ _id: taskId, assignedTo: userId }, update, { new: true });
  }
};

export const deleteTaskService = async (taskId: string) => {
  return Task.findByIdAndDelete(taskId);
};

export const getMyTasksService = async (userId: string) => {
  return Task.find({ assignedTo: userId }).populate('createdBy assignedTo', 'name email');
}; 