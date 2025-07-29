import User, { IUser } from '../models/User';

export const getAllUsersService = async (): Promise<IUser[]> => {
  try {
    return await User.find({}, 'name email role');
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};

export const getUserByIdService = async (userId: string): Promise<IUser | null> => {
  try {
    return await User.findById(userId).select('-password');
  } catch (error) {
    throw new Error('Failed to fetch user');
  }
};

export const updateUserService = async (
  userId: string, 
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  try {
    return await User.findByIdAndUpdate(
      userId, 
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
  } catch (error) {
    throw new Error('Failed to update user');
  }
};

export const deleteUserService = async (userId: string): Promise<{ message: string }> => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { message: 'User deleted successfully' };
  } catch (error) {
    throw new Error('Failed to delete user');
  }
};
