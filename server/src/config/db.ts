// Ignore SSL certificate validation errors in dev mode for local/proxy networks
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve and load .env file from the project root and server directories
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI;
    if (!connString) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const loggedUri = connString.replace(/:([^@]+)@/, ":******@");
    console.log(`Attempting to connect to: ${loggedUri}`);

    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error details:`, error);
    throw error;
  }
};

export default connectDB;
