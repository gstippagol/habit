import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Please set it in your environment variables or .env file.");
    }
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("The server will start, but database features will be unavailable.");
    console.error("DEBUG: Check if MONGO_URI is set correctly in your Render dashboard or local .env");
  }
};

export default connectDB;