import Task from '../models/Task';
import { Types } from 'mongoose';
import { getIO, getUserSocketId, getAdminSocketIds } from '../sockets/socket';
import User from '../models/User';

export const getTasksService = async (userId: string, role: string) => {
  if (role === 'admin') {
    return Task.find().populate('createdBy assignedTo', 'name email');
  } else {
    return Task.find({ assignedTo: userId }).populate('createdBy assignedTo', 'name email');
  }
};

export const createTaskService = async (data: any) => {
  const task = await Task.create(data);
  // Notify assigned user (already implemented)
  // Notify all admins
  const admins = await User.find({ role: 'admin' }, '_id');
  const adminSocketIds = getAdminSocketIds(admins.map(a => String(a._id)));
  adminSocketIds.filter(Boolean).forEach(socketId => {
    getIO().to(socketId as string).emit('task_created', {
      taskId: task._id,
      title: task.title,
      assignedTo: task.assignedTo,
    });
  });
  const assignedSocketId = getUserSocketId(String(task.assignedTo));
  if (assignedSocketId) {
    getIO().to(assignedSocketId).emit('task_created', {
      taskId: task._id,
      title: task.title,
      assignedTo: task.assignedTo,
    });
  }
  return task;
};

export const updateTaskService = async (taskId: string, userId: string, role: string, update: any) => {
  let task;
  if (role === 'admin') {
    task = await Task.findByIdAndUpdate(taskId, update, { new: true });
  } else {
    task = await Task.findOneAndUpdate({ _id: taskId, assignedTo: userId }, update, { new: true });
  }
  if (task) {
    const socketId = getUserSocketId(String(task.assignedTo));
    if (socketId) {
      getIO().to(socketId).emit('task_updated', {
        taskId: task._id,
        title: task.title,
        assignedTo: task.assignedTo,
      });
    }
    // Notify all admins
    const admins = await User.find({ role: 'admin' }, '_id');
    const adminSocketIds = getAdminSocketIds(admins.map(a => String(a._id)));
    adminSocketIds.filter(Boolean).forEach(socketId => {
      getIO().to(socketId as string).emit('task_updated', {
        taskId: task._id,
        newStatus: task.status,
      });
    });
  }
  return task;
};

export const deleteTaskService = async (taskId: string) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (task) {
    // Notify assigned user
    const socketId = getUserSocketId(String(task.assignedTo));
    if (socketId) {
      getIO().to(socketId).emit('task_deleted', {
        taskId: task._id,
        title: task.title,
        assignedTo: task.assignedTo,
      });
    }
    // Notify all admins
    const admins = await User.find({ role: 'admin' }, '_id');
    const adminSocketIds = getAdminSocketIds(admins.map(a => String(a._id)));
    adminSocketIds.filter(Boolean).forEach(socketId => {
      getIO().to(socketId as string).emit('task_deleted', {
        taskId: task._id,
        title: task.title,
        assignedTo: task.assignedTo,
      });
    });
  }
  return task;
};

export const getMyTasksService = async (userId: string) => {
  return Task.find({ assignedTo: userId }).populate('createdBy assignedTo', 'name email');
}; 