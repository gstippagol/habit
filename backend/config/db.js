import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Please set it in your environment variables or .env file.');
  }

  console.log('Attempting to connect to MongoDB...');

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds to find a server
      socketTimeoutMS: 45000,          // 45 seconds for socket to time out
      bufferCommands: true,
      maxPoolSize: 10
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('DEBUG: Check if MONGO_URI is set correctly in your Render dashboard or local .env');
    throw error; // Re-throw so server.js knows the DB failed
  }
};

export default connectDB;