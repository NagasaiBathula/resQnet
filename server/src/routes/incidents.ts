import express from "express";
import { protect, authorize, AuthenticatedRequest } from "../middleware/auth.js";
import Incident from "../models/Incident.js";
import User from "../models/User.js";
import { INCIDENT_STATUS, isValidTransition, IncidentStatusType } from "../constants/incident-status.js";

const router = express.Router();

// @desc    Create incident
// @route   POST /api/incidents
// @access  Private (All authenticated roles)
router.post("/", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, category, severity, coordinates, state, district, address, attachments } = req.body;

    if (!title || !description || !category || !severity || !coordinates || !state || !district) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Normalize severity to match mongoose enum (capitalized)
    const normalizedSeverity = typeof severity === "string"
      ? severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
      : severity;

    const incident = await Incident.create({
      title,
      description,
      category,
      severity: normalizedSeverity,
      coordinates,
      state,
      district,
      address,
      attachments: attachments || [],
      reportedBy: req.user._id,
      reportedByRole: req.user.role,
      status: INCIDENT_STATUS.REPORTED,
    });

    res.status(201).json(incident);
  } catch (error: any) {
    console.error("Error creating incident:", error);
    res.status(500).json({ message: "Server error creating incident", error: error.message });
  }
});

// @desc    Get user-specific incidents
// @route   GET /api/incidents/my
// @access  Private (All authenticated roles)
router.get("/my", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;
    let query = {};

    if (role === "citizen") {
      query = { reportedBy: userId };
    } else if (role === "volunteer") {
      query = { assignedVolunteers: userId };
    } else if (role === "rescue") {
      query = { assignedRescueTeam: userId };
    }
    // authority and admin can view all

    const incidentsList = await Incident.find(query)
      .populate("reportedBy", "name mobileNumber email role avatar")
      .populate("assignedRescueTeam", "name mobileNumber email organizationName employeeId designation")
      .populate("assignedVolunteers", "name mobileNumber email skills availability")
      .sort({ createdAt: -1 });

    res.status(200).json(incidentsList);
  } catch (error: any) {
    console.error("Error fetching my incidents:", error);
    res.status(500).json({ message: "Server error fetching incidents", error: error.message });
  }
});

// @desc    Get all incidents (with filters)
// @route   GET /api/incidents
// @access  Private (All authenticated roles)
router.get("/", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, category, severity } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;
    
    if (severity) {
      query.severity = typeof severity === "string"
        ? severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
        : severity;
    }

    const incidentsList = await Incident.find(query)
      .populate("reportedBy", "name mobileNumber email role avatar")
      .populate("assignedRescueTeam", "name mobileNumber email organizationName employeeId designation")
      .populate("assignedVolunteers", "name mobileNumber email skills availability")
      .sort({ createdAt: -1 });

    res.status(200).json(incidentsList);
  } catch (error: any) {
    console.error("Error listing incidents:", error);
    res.status(500).json({ message: "Server error listing incidents", error: error.message });
  }
});

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Private (All authenticated roles)
router.get("/:id", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const param = req.params.id;
    
    // Check if parameter is a valid ObjectId, otherwise query by incidentNumber
    const query = param.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: param } 
      : { incidentNumber: param };

    const incident = await Incident.findOne(query)
      .populate("reportedBy", "name mobileNumber email role avatar")
      .populate("assignedRescueTeam", "name mobileNumber email organizationName employeeId designation")
      .populate("assignedVolunteers", "name mobileNumber email skills availability");

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.status(200).json(incident);
  } catch (error: any) {
    console.error("Error fetching incident:", error);
    res.status(500).json({ message: "Server error fetching incident", error: error.message });
  }
});

// @desc    Update incident status
// @route   PUT /api/incidents/:id/status
// @access  Private (Rescue Team, Authority, Admin)
router.put("/:id/status", protect, authorize("rescue", "authority", "admin"), async (req: AuthenticatedRequest, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status value is required" });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // Role check: Rescue team can only update their assigned incidents
    if (req.user.role === "rescue") {
      if (!incident.assignedRescueTeam || incident.assignedRescueTeam.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Rescue teams may only update status for assigned incidents" });
      }
    }

    // Validate workflow transition
    if (!isValidTransition(incident.status as IncidentStatusType, status as IncidentStatusType)) {
      return res.status(400).json({ 
        message: `Invalid status transition from '${incident.status}' to '${status}'` 
      });
    }

    incident.status = status;
    if (resolutionNotes !== undefined) {
      incident.resolutionNotes = resolutionNotes;
    }

    await incident.save();

    res.status(200).json(incident);
  } catch (error: any) {
    console.error("Error updating incident status:", error);
    res.status(500).json({ message: "Server error updating status", error: error.message });
  }
});

// @desc    Assign responders to incident
// @route   PUT /api/incidents/:id/assign
// @access  Private (Authority, Admin)
router.put("/:id/assign", protect, authorize("authority", "admin"), async (req: AuthenticatedRequest, res) => {
  try {
    const { assignedRescueTeam, assignedVolunteers } = req.body;
    
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // Update assignment fields
    if (assignedRescueTeam !== undefined) {
      if (assignedRescueTeam) {
        const teamUser = await User.findById(assignedRescueTeam);
        if (!teamUser || teamUser.role !== "rescue") {
          return res.status(400).json({ message: "Assigned rescue team user is invalid or not a rescue team responder" });
        }
        incident.assignedRescueTeam = teamUser._id;
      } else {
        incident.assignedRescueTeam = undefined;
      }
    }

    if (assignedVolunteers !== undefined) {
      // Validate volunteer users
      if (assignedVolunteers.length > 0) {
        const volunteersList = await User.find({ _id: { $in: assignedVolunteers }, role: "volunteer" });
        incident.assignedVolunteers = volunteersList.map(v => v._id);
      } else {
        incident.assignedVolunteers = [];
      }
    }

    // Auto-advance status to Assigned if the current status is Verified
    if (incident.status === INCIDENT_STATUS.VERIFIED) {
      incident.status = INCIDENT_STATUS.ASSIGNED;
    }

    await incident.save();

    // Populate and return updated incident
    const updatedIncident = await Incident.findById(incident._id)
      .populate("reportedBy", "name mobileNumber email role avatar")
      .populate("assignedRescueTeam", "name mobileNumber email organizationName employeeId designation")
      .populate("assignedVolunteers", "name mobileNumber email skills availability");

    res.status(200).json(updatedIncident);
  } catch (error: any) {
    console.error("Error assigning responders:", error);
    res.status(500).json({ message: "Server error assigning responders", error: error.message });
  }
});

export default router;
