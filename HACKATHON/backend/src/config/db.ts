import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);

let isConnected = false;

/**
 * Connects to MongoDB with pooling + auto-reconnect. Mongoose's driver
 * already retries transient disconnects internally; the listeners here are
 * purely for visibility (structured logs), not extra reconnect logic that
 * would fight the driver's own state machine.
 */
export async function connectDB(): Promise<void> {
  if (isConnected) return;

  mongoose.connection.on('connected', () => console.log('🍃 MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('🍃 MongoDB connection error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('🍃 MongoDB disconnected — driver will attempt to reconnect'));
  mongoose.connection.on('reconnected', () => console.log('🍃 MongoDB reconnected'));

  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    autoIndex: env.NODE_ENV !== 'production', // build indexes from schema in dev; run them via a migration in prod
  });

  isConnected = true;
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}
