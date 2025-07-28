import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  message: string;
  userId: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>({
  message: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>('Notification', NotificationSchema); 