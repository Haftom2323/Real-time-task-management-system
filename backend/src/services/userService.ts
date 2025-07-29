import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';

import { Document } from 'mongoose';

// Interface for the user data we want to return
interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend IUser with Mongoose document properties
type UserDocument = IUser & Document & {
  createdAt: Date;
  updatedAt: Date;
  _id: any; // Mongoose ID type
};

export const createUserService = async (userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUserResponse> => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create new user
    const newUser = new User({
      ...userData,
      password: hashedPassword
    });

    await newUser.save();
    
    // Type assertion for the new user document
    const userDoc = newUser as unknown as UserDocument;
    
    // Create response object
    const response: IUserResponse = {
      _id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    };
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user');
  }
};

export const getAllUsersService = async (): Promise<IUserResponse[]> => {
  try {
    const users = await User.find({}, 'name email role createdAt updatedAt') as unknown as UserDocument[];
    return users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};

export const getUserByIdService = async (userId: string): Promise<IUserResponse | null> => {
  try {
    const user = await User.findById(userId).select('-password') as unknown as (UserDocument | null);
    if (!user) return null;
    
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    throw new Error('Failed to fetch user');
  }
};

export const updateUserService = async (
  userId: string, 
  updateData: Partial<IUser>
): Promise<IUserResponse | null> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password') as unknown as UserDocument | null;
    
    if (!updatedUser) return null;
    
    return {
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
  } catch (error) {
    throw new Error('Failed to update user');
  }
};

export const deleteUserService = async (userId: string): Promise<{ message: string }> => {
  try {
    const user = await User.findByIdAndDelete(userId) as unknown as (UserDocument | null);
    if (!user) {
      throw new Error('User not found');
    }
    return { message: 'User deleted successfully' };
  } catch (error) {
    throw new Error('Failed to delete user');
  }
};
