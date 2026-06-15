import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["citizen", "volunteer", "rescue", "authority", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },

    // Future assignment and routing fields
    serviceAreaState: {
      type: String,
    },
    serviceAreaDistrict: {
      type: String,
    },

    // Volunteer Fields
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ["Full Time", "Part Time", "Weekends"],
    },
    volunteerExperience: {
      type: String,
      default: "",
    },

    // Rescue Fields
    organizationName: {
      type: String,
    },
    employeeId: {
      type: String,
    },
    designation: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
    },
    specialization: {
      type: String,
    },
    officialIdDocument: {
      fileName: String,
      fileType: String,
    },

    // Emergency Contact (Shared Volunteer/Rescue)
    emergencyContactName: {
      type: String,
    },
    emergencyContactNumber: {
      type: String,
    },

    // Authority Fields
    department: {
      type: String,
    },
    authorityStatus: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },

    // Approval Audit Fields
    approvedBy: {
      type: String,
      default: "",
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: "",
    },

    // Future Metrics Fields
    approvedIncidentsCount: {
      type: Number,
      default: 0,
    },
    completedMissionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Middleware to default service area state and district if not specified
userSchema.pre("save", function (next) {
  if (!this.serviceAreaState) {
    this.serviceAreaState = this.state;
  }
  if (!this.serviceAreaDistrict) {
    this.serviceAreaDistrict = this.district;
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
