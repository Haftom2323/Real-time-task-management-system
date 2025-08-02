import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User';
import connectDB from '../config/db';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in environment variables.');
    mongoose.disconnect();
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists.');
    mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, role: 'admin' });

  console.log('✅ Admin user created:', email);
  mongoose.disconnect();
};

seedAdmin();
