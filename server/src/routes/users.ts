import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, authorize, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "resqnet_jwt_secret", {
    expiresIn: "30d",
  });
};

// @desc    Create a new user internally (Volunteer, Rescue Team, or Authority) by Admin/Authority
// @route   POST /api/users
// @access  Private (Admin & Authority)
router.post(
  "/",
  protect,
  authorize("admin", "authority"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        email,
        mobileNumber,
        password,
        role,
        state,
        district,
        age,
        gender,
        skills,
        availability,
        volunteerExperience,
        organizationName,
        employeeId,
        designation,
        yearsOfExperience,
        specialization,
        emergencyContactName,
        emergencyContactNumber,
        department,
        authorityStatus,
      } = req.body;

      if (!email || !password || !name || !role || !mobileNumber || !state || !district) {
        return res.status(400).json({ message: "Please provide all required fields" });
      }

      // Role creation restrictions
      if (req.user.role === "authority" && !["volunteer", "rescue"].includes(role)) {
        return res
          .status(403)
          .json({ message: "Authority can only create Volunteers or Rescue Teams" });
      }
      if (req.user.role === "admin" && !["volunteer", "rescue", "authority"].includes(role)) {
        return res
          .status(403)
          .json({ message: "Admin can only create Volunteers, Rescue Teams, or Authorities" });
      }

      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Default service area matching state and district
      const serviceAreaState = state;
      const serviceAreaDistrict = district;

      const userPayload: any = {
        name,
        email: email.toLowerCase(),
        mobileNumber,
        password: hashedPassword,
        role,
        status: "approved", // Trusted internally created user
        state,
        district,
        address: req.body.address || `Created by ${req.user.role}, ${district}, ${state}`,
        serviceAreaState,
        serviceAreaDistrict,
        age: age ? parseInt(age) : undefined,
        gender,
        skills: skills || [],
        availability,
        volunteerExperience,
        organizationName,
        employeeId,
        designation,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        specialization,
        emergencyContactName,
        emergencyContactNumber,
      };

      if (role === "authority") {
        userPayload.department = department || "Disaster Management Authority";
        userPayload.designation = designation || "Disaster Management Officer";
        userPayload.authorityStatus = authorityStatus || "Active";
      }

      const user = await User.create(userPayload);
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error creating user" });
    }
  },
);

// @desc    Public registration request (Citizen, Volunteer, Rescue)
// @route   POST /api/users/requests
// @access  Public
router.post("/requests", async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      password,
      role,
      state,
      district,
      address,
      age,
      gender,
      skills,
      availability,
      volunteerExperience,
      organizationName,
      employeeId,
      designation,
      yearsOfExperience,
      specialization,
      officialIdDocument,
      emergencyContactName,
      emergencyContactNumber,
    } = req.body;

    if (!email || !password || !name || !role || !mobileNumber || !state || !district || !address) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const allowedSignupRoles = ["citizen", "volunteer", "rescue"];
    if (!allowedSignupRoles.includes(role)) {
      return res.status(400).json({ message: "Registration is not permitted for this role" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default status logic
    const status = role === "citizen" ? "approved" : "pending";

    // Set serviceArea defaults
    const serviceAreaState = state;
    const serviceAreaDistrict = district;

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      mobileNumber,
      role,
      status,
      state,
      district,
      address,
      serviceAreaState,
      serviceAreaDistrict,
      age,
      gender,
      skills,
      availability,
      volunteerExperience,
      organizationName,
      employeeId,
      designation,
      yearsOfExperience,
      specialization,
      officialIdDocument,
      emergencyContactName,
      emergencyContactNumber,
    });

    if (user) {
      const responseData: any = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        location: `${district}, ${state}`,
      };

      if (status === "approved") {
        responseData.token = generateToken(user._id.toString());
      }

      return res.status(201).json(responseData);
    } else {
      return res.status(400).json({ message: "Invalid registration data" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during registration request" });
  }
});

// @desc    Get user registration requests (Volunteers & Rescue Teams)
// @route   GET /api/users/requests
// @access  Private (Authority & Admin)
router.get(
  "/requests",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, role, search } = req.query;

      const query: any = {
        role: { $in: ["volunteer", "rescue"] },
      };

      if (status) {
        query.status = status;
      }
      if (role) {
        query.role = role;
      }

      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        query.$or = [{ name: searchRegex }, { email: searchRegex }, { mobileNumber: searchRegex }];
      }

      const requests = await User.find(query).sort({ createdAt: -1 });
      return res.json(requests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error fetching requests" });
    }
  },
);

// @desc    Approve or Reject registration request
// @route   PUT /api/users/requests/:id/status
// @access  Private (Authority & Admin)
router.put(
  "/requests/:id/status",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status code" });
      }

      if (status === "rejected" && !rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Request not found" });
      }

      user.status = status;
      user.approvedBy = req.user.name || req.user.email;
      user.approvalDate = new Date();
      if (status === "rejected") {
        user.rejectionReason = rejectionReason;
      } else {
        user.rejectionReason = "";
      }

      await user.save();
      return res.json({ message: `Application ${status} successfully`, user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error updating request status" });
    }
  },
);

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin Only)
router.get(
  "/",
  protect,
  authorize("admin", "authority"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, role } = req.query;
      const query: any = {};

      if (role) {
        query.role = role;
      }

      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        query.$or = [{ name: searchRegex }, { email: searchRegex }, { mobileNumber: searchRegex }];
      }

      const users = await User.find(query).sort({ createdAt: -1 });
      return res.json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error fetching users" });
    }
  },
);

// @desc    Get all authority accounts
// @route   GET /api/users/authorities
// @access  Private (Admin Only)
router.get(
  "/authorities",
  protect,
  authorize("admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const authorities = await User.find({ role: "authority" }).sort({ createdAt: -1 });
      return res.json(authorities);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error fetching authorities" });
    }
  },
);

// @desc    Create a new authority account
// @route   POST /api/users/authority
// @access  Private (Admin Only)
router.post(
  "/authority",
  protect,
  authorize("admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, email, mobileNumber, password, state, district, department, designation } =
        req.body;

      if (
        !name ||
        !email ||
        !mobileNumber ||
        !password ||
        !state ||
        !district ||
        !department ||
        !designation
      ) {
        return res.status(400).json({ message: "Please provide all required fields" });
      }

      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const authority = await User.create({
        name,
        email: email.toLowerCase(),
        mobileNumber,
        password: hashedPassword,
        role: "authority",
        status: "approved",
        state,
        district,
        address: `Govt Dept, ${district}, ${state}`,
        department,
        designation,
        authorityStatus: "Active",
      });

      return res.status(201).json(authority);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error creating authority" });
    }
  },
);

// @desc    Update authority details / status
// @route   PUT /api/users/authority/:id
// @access  Private (Admin Only)
router.put(
  "/authority/:id",
  protect,
  authorize("admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, mobileNumber, state, district, department, designation, authorityStatus } =
        req.body;

      const user = await User.findById(id);
      if (!user || user.role !== "authority") {
        return res.status(404).json({ message: "Authority account not found" });
      }

      if (name) user.name = name;
      if (mobileNumber) user.mobileNumber = mobileNumber;
      if (state) user.state = state;
      if (district) user.district = district;
      if (department) user.department = department;
      if (designation) user.designation = designation;
      if (authorityStatus) user.authorityStatus = authorityStatus;

      await user.save();
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error updating authority" });
    }
  },
);

// @desc    Delete authority account
// @route   DELETE /api/users/authority/:id
// @access  Private (Admin Only)
router.delete(
  "/authority/:id",
  protect,
  authorize("admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user || user.role !== "authority") {
        return res.status(404).json({ message: "Authority account not found" });
      }

      await User.findByIdAndDelete(id);
      return res.json({ message: "Authority account deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error deleting authority" });
    }
  },
);

// @desc    Toggle general user status (Admin Only)
// @route   PUT /api/users/:id/role-status
// @access  Private (Admin Only)
router.put(
  "/:id/role-status",
  protect,
  authorize("admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, role, authorityStatus } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (status) user.status = status;
      if (role) user.role = role;
      if (authorityStatus) user.authorityStatus = authorityStatus;

      await user.save();
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error updating user role/status" });
    }
  },
);

export default router;
