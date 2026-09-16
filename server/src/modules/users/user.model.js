import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * User schema. Pure data structure only — password hashing and auth
 * logic belong in the auth module's service layer, not here.
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

export const User = model('User', userSchema);
export default User;
