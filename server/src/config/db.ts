import mongoose from "mongoose";
import dotenv from "dotenv";

// Load dotenv from root if it exists
dotenv.config({ path: "../.env" });
dotenv.config(); // Fallback for local server environment variables

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI;
    if (!connString) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

export default connectDB;
