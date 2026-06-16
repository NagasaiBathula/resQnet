import express from "express";
import { protect, authorize, AuthenticatedRequest } from "../middleware/auth.js";
import Incident from "../models/Incident.js";
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import {
  INCIDENT_STATUS,
  isValidTransition,
  IncidentStatusType,
} from "../constants/incident-status.js";

const router = express.Router();

// @desc    Create incident
// @route   POST /api/incidents
// @access  Private (All authenticated roles)
router.post("/", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      coordinates,
      state,
      district,
      address,
      attachments,
      aiSummary,
      aiCategorySuggested,
      aiSeveritySuggested,
      aiPriority,
      aiDamageAssessment,
      aiConfidence,
      aiRecommendedResources,
    } = req.body;

    if (!title || !description || !category || !severity || !coordinates || !state || !district) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Normalize severity to match mongoose enum (capitalized)
    const normalizedSeverity =
      typeof severity === "string"
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
      aiSummary,
      aiCategorySuggested,
      aiSeveritySuggested,
      aiPriority,
      aiDamageAssessment,
      aiConfidence,
      aiRecommendedResources,
      activityLog: [
        {
          action: "Incident Reported",
          performedBy: req.user._id,
          performedByRole: req.user.role,
          notes: `Emergency reported by ${req.user.name}.${aiSummary ? " AI Triage Summary: " + aiSummary : ""}`,
          timestamp: new Date(),
        },
      ],
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
      .populate(
        "assignedRescueTeam",
        "name mobileNumber email organizationName employeeId designation",
      )
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
      query.severity =
        typeof severity === "string"
          ? severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
          : severity;
    }

    const incidentsList = await Incident.find(query)
      .populate("reportedBy", "name mobileNumber email role avatar")
      .populate(
        "assignedRescueTeam",
        "name mobileNumber email organizationName employeeId designation",
      )
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
    const query = param.match(/^[0-9a-fA-F]{24}$/) ? { _id: param } : { incidentNumber: param };

    const incident = await Incident.findOne(query)
      .populate("reportedBy", "name mobileNumber email role avatar")
      .populate(
        "assignedRescueTeam",
        "name mobileNumber email organizationName employeeId designation",
      )
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
router.put(
  "/:id/status",
  protect,
  authorize("rescue", "authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
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
        if (
          !incident.assignedRescueTeam ||
          incident.assignedRescueTeam.toString() !== req.user._id.toString()
        ) {
          return res
            .status(403)
            .json({ message: "Rescue teams may only update status for assigned incidents" });
        }
      }

      // Validate workflow transition
      if (!isValidTransition(incident.status as IncidentStatusType, status as IncidentStatusType)) {
        return res.status(400).json({
          message: `Invalid status transition from '${incident.status}' to '${status}'`,
        });
      }

      incident.status = status;
      if (resolutionNotes !== undefined) {
        incident.resolutionNotes = resolutionNotes;
      }

      // Capture activity log
      incident.activityLog.push({
        action:
          status === INCIDENT_STATUS.RESOLVED
            ? "Incident Resolved"
            : status === INCIDENT_STATUS.VERIFIED
              ? "Incident Verified"
              : "Status Updated",
        performedBy: req.user._id,
        performedByRole: req.user.role,
        notes:
          status === INCIDENT_STATUS.RESOLVED
            ? `Incident resolved. Notes: ${resolutionNotes || "No notes provided"}`
            : `Incident status updated to ${status}.`,
        timestamp: new Date(),
      });

      // Auto-release resources if status is RESOLVED
      if (status === INCIDENT_STATUS.RESOLVED) {
        const resources = await Resource.find({ assignedIncident: incident._id });
        for (const resItem of resources) {
          resItem.status = "Available";
          resItem.assignedIncident = undefined;
          resItem.assignedTo = undefined;

          // Close out assignment history
          const activeHistory = resItem.assignmentHistory.find(
            (h: any) => h.incidentId.toString() === incident._id.toString() && !h.releasedAt,
          );

          if (activeHistory) {
            activeHistory.releasedAt = new Date();
            const durationHours = parseFloat(
              (
                (new Date().getTime() - activeHistory.assignedAt.getTime()) /
                (1000 * 60 * 60)
              ).toFixed(2),
            );
            resItem.totalUsageHours += Math.max(0.1, durationHours);
          }

          resItem.resourceActivityLog.push({
            action: "Released From Incident",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Auto-released due to incident resolution.`,
            timestamp: new Date(),
          });

          await resItem.save();

          incident.activityLog.push({
            action: "Resource Released",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Resource ${resItem.name} (${resItem.resourceId}) automatically released on resolution.`,
            timestamp: new Date(),
          });
        }
      }

      await incident.save();

      res.status(200).json(incident);
    } catch (error: any) {
      console.error("Error updating incident status:", error);
      res.status(500).json({ message: "Server error updating status", error: error.message });
    }
  },
);

// @desc    Assign responders to incident
// @route   PUT /api/incidents/:id/assign
// @access  Private (Authority, Admin)
router.put(
  "/:id/assign",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
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
            return res.status(400).json({
              message: "Assigned rescue team user is invalid or not a rescue team responder",
            });
          }
          incident.assignedRescueTeam = teamUser._id;
        } else {
          incident.assignedRescueTeam = undefined;
        }
      }

      if (assignedVolunteers !== undefined) {
        // Validate volunteer users
        if (assignedVolunteers.length > 0) {
          const volunteersList = await User.find({
            _id: { $in: assignedVolunteers },
            role: "volunteer",
          });
          incident.assignedVolunteers = volunteersList.map((v) => v._id);
        } else {
          incident.assignedVolunteers = [];
        }
      }

      // Auto-advance status to Assigned if the current status is Verified
      let statusChanged = false;
      if (incident.status === INCIDENT_STATUS.VERIFIED) {
        incident.status = INCIDENT_STATUS.ASSIGNED;
        statusChanged = true;
      }

      incident.activityLog.push({
        action: "Personnel Assigned",
        performedBy: req.user._id,
        performedByRole: req.user.role,
        notes: `Assigned Rescue Team: ${assignedRescueTeam ? "Updated" : "None"}. Volunteers Count: ${assignedVolunteers ? assignedVolunteers.length : 0}.`,
        timestamp: new Date(),
      });

      if (statusChanged) {
        incident.activityLog.push({
          action: "Status Updated",
          performedBy: req.user._id,
          performedByRole: req.user.role,
          notes: "Status advanced to Assigned upon personnel deployment.",
          timestamp: new Date(),
        });
      }

      await incident.save();

      // Populate and return updated incident
      const updatedIncident = await Incident.findById(incident._id)
        .populate("reportedBy", "name mobileNumber email role avatar")
        .populate(
          "assignedRescueTeam",
          "name mobileNumber email organizationName employeeId designation",
        )
        .populate("assignedVolunteers", "name mobileNumber email skills availability");

      res.status(200).json(updatedIncident);
    } catch (error: any) {
      console.error("Error assigning responders:", error);
      res.status(500).json({ message: "Server error assigning responders", error: error.message });
    }
  },
);

// @desc    Allocate or release resources to/from incident
// @route   PUT /api/incidents/:id/resources
// @access  Private (Authority, Admin)
router.put(
  "/:id/resources",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { resourceIds, release } = req.body;

      if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
        return res.status(400).json({ message: "resourceIds array is required" });
      }

      const incident = await Incident.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      const updatedResourceIds: string[] = [];

      for (const rId of resourceIds) {
        const resource = await Resource.findById(rId);
        if (!resource) {
          return res.status(404).json({ message: `Resource with ID ${rId} not found` });
        }

        // Jurisdiction enforcement for Authority role
        if (req.user.role === "authority") {
          if (
            resource.managedByState !== req.user.state ||
            resource.managedByDistrict !== req.user.district
          ) {
            return res.status(403).json({
              message: `Not authorized to manage resource ${resource.name} outside your jurisdiction`,
            });
          }
        }

        if (release) {
          // RELEASE WORKFLOW
          if (resource.assignedIncident?.toString() !== incident._id.toString()) {
            continue; // Skip if not assigned to this incident
          }

          // Close out assignment history
          const activeHistory = resource.assignmentHistory.find(
            (h: any) => h.incidentId.toString() === incident._id.toString() && !h.releasedAt,
          );

          if (activeHistory) {
            activeHistory.releasedAt = new Date();
            const durationHours = parseFloat(
              (
                (new Date().getTime() - activeHistory.assignedAt.getTime()) /
                (1000 * 60 * 60)
              ).toFixed(2),
            );
            resource.totalUsageHours += Math.max(0.1, durationHours);
          }

          resource.status = "Available";
          resource.assignedIncident = undefined;
          resource.assignedTo = undefined;

          resource.resourceActivityLog.push({
            action: "Released From Incident",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Released from incident ${incident.incidentNumber}.`,
            timestamp: new Date(),
          });

          await resource.save();

          incident.activityLog.push({
            action: "Resource Released",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Resource ${resource.name} (${resource.resourceId}) released from incident.`,
            timestamp: new Date(),
          });

          updatedResourceIds.push(resource._id.toString());
        } else {
          // ALLOCATE WORKFLOW
          // Override check: If resource is assigned to another incident, only Admin can override
          if (
            resource.assignedIncident &&
            resource.assignedIncident.toString() !== incident._id.toString()
          ) {
            if (req.user.role !== "admin") {
              return res.status(400).json({
                message: `Resource ${resource.name} (${resource.resourceId}) is already assigned to incident ${resource.assignedIncident}. Only Admins can override this assignment.`,
              });
            }

            // Admin override: Release first from previous incident
            const prevIncident = await Incident.findById(resource.assignedIncident);
            if (prevIncident) {
              const activeHistory = resource.assignmentHistory.find(
                (h: any) =>
                  h.incidentId.toString() === prevIncident._id.toString() && !h.releasedAt,
              );
              if (activeHistory) {
                activeHistory.releasedAt = new Date();
                const durationHours = parseFloat(
                  (
                    (new Date().getTime() - activeHistory.assignedAt.getTime()) /
                    (1000 * 60 * 60)
                  ).toFixed(2),
                );
                resource.totalUsageHours += Math.max(0.1, durationHours);
              }
              prevIncident.activityLog.push({
                action: "Resource Released",
                performedBy: req.user._id,
                performedByRole: req.user.role,
                notes: `Resource overridden and transferred to incident ${incident.incidentNumber} by Admin.`,
                timestamp: new Date(),
              });
              await prevIncident.save();
            }
          }

          // Assign to new incident
          resource.status = "Assigned";
          resource.assignedIncident = incident._id;
          resource.lastAssignedBy = req.user._id;
          resource.lastAssignmentDate = new Date();
          resource.totalAssignments += 1;

          resource.assignmentHistory.push({
            incidentId: incident._id,
            incidentNumber: incident.incidentNumber,
            assignedAt: new Date(),
            assignedBy: req.user._id,
            assignedByRole: req.user.role,
          });

          resource.resourceActivityLog.push({
            action: "Assigned To Incident",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Assigned to incident ${incident.incidentNumber}.`,
            timestamp: new Date(),
          });

          await resource.save();

          // Push snapshot of resource to Incident's allocatedResources
          const alreadyInSnapshot = incident.allocatedResources.some(
            (r) => r.resourceId.toString() === resource._id.toString(),
          );

          if (!alreadyInSnapshot) {
            incident.allocatedResources.push({
              resourceId: resource._id,
              resourceNumber: resource.resourceId,
              name: resource.name,
              type: resource.type,
              assignedAt: new Date(),
            });
          }

          incident.activityLog.push({
            action: "Resource Assigned",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Resource ${resource.name} (${resource.resourceId}) allocated to incident.`,
            timestamp: new Date(),
          });

          updatedResourceIds.push(resource._id.toString());
        }
      }

      await incident.save();

      const populatedIncident = await Incident.findById(incident._id)
        .populate("reportedBy", "name mobileNumber email role avatar")
        .populate(
          "assignedRescueTeam",
          "name mobileNumber email organizationName employeeId designation",
        )
        .populate("assignedVolunteers", "name mobileNumber email skills availability");

      res.status(200).json({
        message: release ? "Resources released successfully" : "Resources allocated successfully",
        incident: populatedIncident,
        updatedResourceIds,
      });
    } catch (error: any) {
      console.error("Error managing resources for incident:", error);
      res
        .status(500)
        .json({ message: "Server error managing incident resources", error: error.message });
    }
  },
);

export default router;
