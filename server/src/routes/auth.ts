import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "resqnet_jwt_secret", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role, avatar, location } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Role validations
    const allowedSignupRoles = ["citizen", "volunteer", "rescue"];
    if (!allowedSignupRoles.includes(role)) {
      return res.status(400).json({ message: "Registration is not permitted for this role" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default status logic
    const status = role === "citizen" ? "approved" : "pending";

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      status,
      avatar:
        avatar ||
        name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      location: location || "India",
    });

    if (user) {
      const responseData: any = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        location: user.location,
      };

      // Only generate and send JWT token if user status is approved
      if (status === "approved") {
        responseData.token = generateToken(user._id.toString());
      }

      return res.status(201).json(responseData);
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during registration" });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check account status
    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is awaiting approval." });
    }
    if (user.status === "rejected") {
      return res
        .status(403)
        .json({ message: "Your registration request has been rejected. Please contact support." });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      location: user.location,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safety check for active JWT from later revoked users
    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is awaiting approval." });
    }
    if (user.status === "rejected") {
      return res
        .status(403)
        .json({ message: "Your registration request has been rejected. Please contact support." });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error fetching user" });
  }
});

export default router;
