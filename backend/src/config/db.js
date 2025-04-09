import mongoose from 'mongoose';
import { config } from './serverConfig.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI);

    console.log('connected to mongodb');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
