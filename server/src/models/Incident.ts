import mongoose from "mongoose";
import { INCIDENT_STATUS } from "../constants/incident-status.js";

export interface IIncident extends mongoose.Document {
  incidentNumber: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  reportedBy: mongoose.Types.ObjectId;
  reportedByRole: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  state: string;
  district: string;
  address?: string;
  assignedRescueTeam?: mongoose.Types.ObjectId;
  assignedVolunteers: mongoose.Types.ObjectId[];
  attachments: {
    fileName: string;
    fileType: string;
  }[];
  resolutionNotes?: string;
  activityLog: {
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedByRole: string;
    timestamp: Date;
    notes?: string;
  }[];
  allocatedResources: {
    resourceId: mongoose.Types.ObjectId;
    resourceNumber: string;
    name: string;
    type: string;
    assignedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const incidentSchema = new mongoose.Schema<IIncident>(
  {
    incidentNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Flood",
        "Fire",
        "Medical Emergency",
        "Road Accident",
        "Landslide",
        "Earthquake",
        "Cyclone",
        "Building Collapse",
        "Missing Person",
        "Other",
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(INCIDENT_STATUS),
      default: INCIDENT_STATUS.REPORTED,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedByRole: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
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
    },
    assignedRescueTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        fileName: String,
        fileType: String,
      },
    ],
    resolutionNotes: {
      type: String,
    },
    activityLog: [
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
    allocatedResources: [
      {
        resourceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Resource",
          required: true,
        },
        resourceNumber: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        assignedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate sequential, human-friendly incidentNumber (INC-2026-XXXX)
incidentSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model("Incident").countDocuments();
      const nextNum = String(count + 1).padStart(4, "0");
      this.incidentNumber = `INC-2026-${nextNum}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

const Incident = mongoose.model<IIncident>("Incident", incidentSchema);

export default Incident;
