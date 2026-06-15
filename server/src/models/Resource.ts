import mongoose from "mongoose";

export interface IResource extends mongoose.Document {
  resourceId: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  state: string;
  district: string;
  assignedIncident?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdByRole: string;
  managedByState: string;
  managedByDistrict: string;
  lastAssignedBy?: mongoose.Types.ObjectId;
  lastAssignmentDate?: Date;
  totalAssignments: number;
  totalUsageHours: number;
  lastUsedAt?: Date;
  resourceActivityLog: {
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedByRole: string;
    timestamp: Date;
    notes?: string;
  }[];
  assignmentHistory: {
    incidentId: mongoose.Types.ObjectId;
    incidentNumber: string;
    assignedAt: Date;
    releasedAt?: Date;
    assignedBy: mongoose.Types.ObjectId;
    assignedByRole: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new mongoose.Schema<IResource>(
  {
    resourceId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Boat",
        "Ambulance",
        "Rescue Vehicle",
        "Medical Kit",
        "Food Supply",
        "Water Supply",
        "Emergency Shelter Kit",
        "Communication Equipment",
        "Generator",
        "Other",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ["Available", "Assigned", "In Use", "Maintenance", "Unavailable"],
      default: "Available",
    },
    description: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    assignedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      required: true,
    },
    managedByState: {
      type: String,
      required: true,
    },
    managedByDistrict: {
      type: String,
      required: true,
    },
    lastAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastAssignmentDate: {
      type: Date,
    },
    totalAssignments: {
      type: Number,
      required: true,
      default: 0,
    },
    totalUsageHours: {
      type: Number,
      required: true,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },
    resourceActivityLog: [
      {
        action: {
          type: String,
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        performedByRole: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
        },
      },
    ],
    assignmentHistory: [
      {
        incidentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Incident",
          required: true,
        },
        incidentNumber: {
          type: String,
          required: true,
        },
        assignedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        releasedAt: {
          type: Date,
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assignedByRole: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate sequential, human-friendly resourceId (RES-2026-XXXX)
resourceSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model("Resource").countDocuments();
      const nextNum = String(count + 1).padStart(4, "0");
      this.resourceId = `RES-2026-${nextNum}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

const Resource = mongoose.models.Resource || mongoose.model<IResource>("Resource", resourceSchema);
export default Resource;
