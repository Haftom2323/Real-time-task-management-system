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
  const io = getIO();
  const creatorSocketId = getUserSocketId(String(data.createdBy));

  for (const [socketId, socket] of io.sockets.sockets) {
    if (socketId !== creatorSocketId) {
      socket.emit('task_created', {
        taskId: task._id,
        title: task.title,
        assignedTo: task.assignedTo,
      });
    }
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
    const io = getIO();
    const updaterSocketId = getUserSocketId(String(userId));
    for (const [socketId, socket] of io.sockets.sockets) {
      if (socketId !== updaterSocketId) {
        socket.emit('task_updated', {
          taskId: task._id,
          newStatus: task.status,
          title: task.title,
          updatedBy: userId
        });
      }
    }
  }
  return task;
};

export const deleteTaskService = async (taskId: string, userId: string) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (task) {
    const io = getIO();
    const deleterSocketId = getUserSocketId(String(userId));
    for (const [socketId, socket] of io.sockets.sockets) {
      if (socketId !== deleterSocketId) {
        socket.emit('task_deleted', {
          taskId: task._id,
          title: task.title,
          assignedTo: task.assignedTo,
        });
      }
    }
  }
  return task;
};

export const getMyTasksService = async (userId: string) => {
  return Task.find({ assignedTo: userId }).populate('createdBy assignedTo', 'name email');
};