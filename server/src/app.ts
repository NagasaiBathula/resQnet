import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import incidentRoutes from "./routes/incidents.js";
import resourceRoutes from "./routes/resources.js";
import aiRoutes from "./routes/ai.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve and load .env file from the project root and server directories
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8081",
      "http://localhost:8080",
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/ai", aiRoutes);

// Health Check API
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "ResQNet AI API Server is online and healthy",
  });
});

// Database and Seeding Init
export const initDB = async () => {
  // Prevent duplicate connections on hot reload in dev
  if (mongoose.connection.readyState >= 1) {
    console.log("✓ MongoDB is already connected/connecting");
    return;
  }

  await connectDB();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("demo123", salt);

    const demoUsersList = [
      {
        email: "citizen@resqnet.ai",
        password: hashedPassword,
        name: "Aarav Sharma",
        mobileNumber: "9876543201",
        role: "citizen",
        status: "approved",
        state: "Maharashtra",
        district: "Mumbai",
        address: "Sector 12, Andheri West",
        avatar: "AS",
        location: "Mumbai, IN",
      },
      {
        email: "volunteer@resqnet.ai",
        password: hashedPassword,
        name: "Priya Patel",
        mobileNumber: "9876543202",
        role: "volunteer",
        status: "approved",
        state: "Tamil Nadu",
        district: "Chennai",
        address: "12 Main Road, Adyar",
        avatar: "PP",
        location: "Chennai, IN",
        age: 26,
        gender: "Female",
        skills: ["First Aid", "Food Distribution", "Emergency Communication"],
        availability: "Weekends",
        volunteerExperience: "Assisted in local flood relief work in 2024.",
        emergencyContactName: "Raj Patel",
        emergencyContactNumber: "9876543205",
      },
      {
        email: "rescue@resqnet.ai",
        password: hashedPassword,
        name: "Cmdr. Rohan Mehta",
        mobileNumber: "9876543203",
        role: "rescue",
        status: "approved",
        state: "Delhi",
        district: "New Delhi",
        address: "NDRF HQ, Sector 1",
        avatar: "RM",
        location: "Delhi, IN",
        organizationName: "National Disaster Response Force",
        employeeId: "NDRF-762",
        designation: "Disaster Response Officer",
        yearsOfExperience: 8,
        specialization: "Flood Rescue",
        officialIdDocument: {
          fileName: "rohan-id.pdf",
          fileType: "application/pdf",
        },
        emergencyContactName: "Meera Mehta",
        emergencyContactNumber: "9876543206",
      },
      {
        email: "authority@resqnet.ai",
        password: hashedPassword,
        name: "Dr. Anita Rao",
        mobileNumber: "9876543204",
        role: "authority",
        status: "approved",
        state: "Delhi",
        district: "New Delhi",
        address: "NDMA Office, Safdarjung",
        avatar: "AR",
        location: "New Delhi, IN",
        department: "Disaster Management Authority",
        designation: "Disaster Management Officer",
        authorityStatus: "Active",
      },
      {
        email: "admin@resqnet.ai",
        password: hashedPassword,
        name: "System Admin",
        mobileNumber: "9876543200",
        role: "admin",
        status: "approved",
        state: "HQ",
        district: "HQ",
        address: "ResQNet Central Command",
        avatar: "SA",
        location: "HQ",
      },
    ];

    for (const u of demoUsersList) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`✓ Seeded missing demo account: ${u.email}`);
      } else {
        exists.state = u.state;
        exists.district = u.district;
        exists.role = u.role;
        exists.status = u.status;
        exists.address = u.address;
        exists.mobileNumber = u.mobileNumber;
        exists.name = u.name;
        if (u.age) exists.age = u.age;
        if (u.skills) exists.skills = u.skills;
        if (u.availability) exists.availability = u.availability;
        if (u.organizationName) exists.organizationName = u.organizationName;
        await exists.save();
      }
    }

    // Ensure all demo users are marked as approved and active
    await User.updateMany(
      {
        email: {
          $in: [
            "citizen@resqnet.ai",
            "volunteer@resqnet.ai",
            "rescue@resqnet.ai",
            "authority@resqnet.ai",
            "admin@resqnet.ai",
          ],
        },
      },
      { $set: { status: "approved" } },
    );
    console.log("✓ Verified status of existing demo accounts");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};

export default app;
