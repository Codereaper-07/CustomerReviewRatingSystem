import mongoose from 'mongoose';
import env from './env.js';

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB Atlas (source of truth).
 * Mongoose models are defined per-module and are not created here.
 */
export async function connectDB() {
  mongoose.connection.on('connected', () => {
    console.log('[db] MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  await mongoose.connect(env.mongodbUri);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

export default mongoose;
