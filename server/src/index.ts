import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  app.listen(env.PORT, () => {
    console.log(`To-Do API listening on port ${env.PORT}`);
  });
};

start().catch((error: unknown) => {
  console.error('Failed to start the To-Do API:', error);
  process.exitCode = 1;
});
