import express from "express";
import { protect, authorize, AuthenticatedRequest } from "../middleware/auth.js";
import Resource from "../models/Resource.js";
import Incident from "../models/Incident.js";

const router = express.Router();

// @desc    Get all resources (with filters and jurisdiction limits)
// @route   GET /api/resources
// @access  Private
router.get("/", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const role = req.user.role;
    const query: any = {};

    // Jurisdiction enforcement
    if (role === "authority") {
      query.managedByState = req.user.state;
      query.managedByDistrict = req.user.district;
    } else if (role === "rescue") {
      // Rescue teams view resources assigned to their active incidents
      const incidents = await Incident.find({ assignedRescueTeam: req.user._id });
      const incidentIds = incidents.map((i) => i._id);
      query.assignedIncident = { $in: incidentIds };
    } else if (role === "volunteer") {
      // Volunteers view resources assigned to their active incidents
      const incidents = await Incident.find({ assignedVolunteers: req.user._id });
      const incidentIds = incidents.map((i) => i._id);
      query.assignedIncident = { $in: incidentIds };
    }
    // Admins have global access, no filter.

    // Additional query filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    if (req.query.state) query.state = req.query.state;
    if (req.query.district) query.district = req.query.district;
    if (req.query.assignedIncident) query.assignedIncident = req.query.assignedIncident;

    const resources = await Resource.find(query)
      .populate("assignedIncident", "incidentNumber title status")
      .populate("assignedTo", "name role")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error: any) {
    console.error("Error listing resources:", error);
    res.status(500).json({ message: "Server error listing resources", error: error.message });
  }
});

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
router.get("/:id", protect, async (req: AuthenticatedRequest, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate("assignedIncident", "incidentNumber title status")
      .populate("assignedTo", "name role")
      .populate("createdBy", "name role");

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Role checks
    if (req.user.role === "authority") {
      if (
        resource.managedByState !== req.user.state ||
        resource.managedByDistrict !== req.user.district
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to view resources outside your jurisdiction" });
      }
    }

    res.status(200).json(resource);
  } catch (error: any) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ message: "Server error fetching resource", error: error.message });
  }
});

// @desc    Create resource
// @route   POST /api/resources
// @access  Private (Authority, Admin)
router.post(
  "/",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, type, description, state, district } = req.body;

      if (!name || !type) {
        return res.status(400).json({ message: "Name and Type are required" });
      }

      // Pre-fill state and district based on authority/admin's profile if not passed
      const resourceState = state || req.user.state;
      const resourceDistrict = district || req.user.district;

      const resource = new Resource({
        name,
        type,
        description,
        state: resourceState,
        district: resourceDistrict,
        createdBy: req.user._id,
        createdByRole: req.user.role,
        managedByState: req.user.state, // Bound to authority's own jurisdiction
        managedByDistrict: req.user.district,
        status: "Available",
        totalAssignments: 0,
        totalUsageHours: 0,
        resourceActivityLog: [
          {
            action: "Resource Created",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: "Initial registration of asset in system stockpile.",
          },
        ],
      });

      await resource.save();
      res.status(201).json(resource);
    } catch (error: any) {
      console.error("Error creating resource:", error);
      res.status(500).json({ message: "Server error creating resource", error: error.message });
    }
  },
);

// @desc    Edit resource
// @route   PUT /api/resources/:id
// @access  Private (Authority, Admin)
router.put(
  "/:id",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, type, description, state, district, managedByState, managedByDistrict } = req.body;

      const resource = await Resource.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Jurisdiction check
      if (req.user.role === "authority") {
        if (
          resource.managedByState !== req.user.state ||
          resource.managedByDistrict !== req.user.district
        ) {
          return res
            .status(403)
            .json({ message: "Not authorized to edit resources outside your jurisdiction" });
        }
      }

      if (name !== undefined) resource.name = name;
      if (type !== undefined) resource.type = type;
      if (description !== undefined) resource.description = description;
      if (state !== undefined) resource.state = state;
      if (district !== undefined) resource.district = district;
      
      if (req.user.role === "admin") {
        if (managedByState !== undefined) resource.managedByState = managedByState;
        if (managedByDistrict !== undefined) resource.managedByDistrict = managedByDistrict;
      }

      resource.resourceActivityLog.push({
        action: "Status Updated",
        performedBy: req.user._id,
        performedByRole: req.user.role,
        notes: "Resource specifications modified.",
        timestamp: new Date(),
      });

      await resource.save();
      res.status(200).json(resource);
    } catch (error: any) {
      console.error("Error updating resource:", error);
      res.status(500).json({ message: "Server error updating resource", error: error.message });
    }
  },
);

// @desc    Update resource operational status
// @route   PUT /api/resources/:id/status
// @access  Private (Rescue Team, Authority, Admin)
router.put(
  "/:id/status",
  protect,
  authorize("rescue", "authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { status, notes } = req.body;
      const allowedStatuses = ["Available", "Assigned", "In Use", "Maintenance", "Unavailable"];

      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const resource = await Resource.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const userRole = req.user.role;

      // Role-based restrictions
      if (userRole === "authority") {
        if (
          resource.managedByState !== req.user.state ||
          resource.managedByDistrict !== req.user.district
        ) {
          return res
            .status(403)
            .json({ message: "Not authorized to update resources outside your jurisdiction" });
        }
      }

      if (userRole === "rescue") {
        // Can only view/update status of assigned resources
        if (!resource.assignedIncident) {
          return res
            .status(403)
            .json({ message: "Rescue teams can only update status of assigned resources" });
        }

        // Verify if rescue team is assigned to the incident
        const incident = await Incident.findById(resource.assignedIncident);
        if (
          !incident ||
          !incident.assignedRescueTeam ||
          incident.assignedRescueTeam.toString() !== req.user._id.toString()
        ) {
          return res.status(403).json({
            message: "Rescue teams can only update resources assigned to their active incidents",
          });
        }

        // Can only change to "In Use" or "Available"
        if (status !== "In Use" && status !== "Available") {
          return res
            .status(400)
            .json({ message: "Rescue teams can only mark resources as In Use or Available" });
        }
      }

      // Capture transition logic
      const prevStatus = resource.status;
      resource.status = status;

      if (status === "In Use") {
        resource.lastUsedAt = new Date();
      }

      // Log the change
      resource.resourceActivityLog.push({
        action:
          status === "In Use"
            ? "Status Updated"
            : status === "Maintenance"
              ? "Marked Maintenance"
              : "Status Updated",
        performedBy: req.user._id,
        performedByRole: req.user.role,
        notes: notes || `Operational status updated from ${prevStatus} to ${status}.`,
        timestamp: new Date(),
      });

      // If Rescue Team marks as Available, trigger release workflow
      if (status === "Available" && resource.assignedIncident) {
        const incident = await Incident.findById(resource.assignedIncident);
        if (incident) {
          // Find assignment history and close it
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

          resource.resourceActivityLog.push({
            action: "Released From Incident",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Released from incident ${incident.incidentNumber} via rescue team completion.`,
            timestamp: new Date(),
          });

          // Add incident timeline log
          incident.activityLog.push({
            action: "Resource Released",
            performedBy: req.user._id,
            performedByRole: req.user.role,
            notes: `Resource ${resource.name} (${resource.resourceId}) released from incident by rescue team.`,
            timestamp: new Date(),
          });

          await incident.save();
        }
        resource.assignedIncident = undefined;
        resource.assignedTo = undefined;
      }

      await resource.save();
      res.status(200).json(resource);
    } catch (error: any) {
      console.error("Error updating resource status:", error);
      res
        .status(500)
        .json({ message: "Server error updating resource status", error: error.message });
    }
  },
);

// @desc    Release resource from incident
// @route   PUT /api/resources/:id/release
// @access  Private (Authority, Admin)
router.put(
  "/:id/release",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const resource = await Resource.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      if (req.user.role === "authority") {
        if (
          resource.managedByState !== req.user.state ||
          resource.managedByDistrict !== req.user.district
        ) {
          return res
            .status(403)
            .json({ message: "Not authorized to release resources outside your jurisdiction" });
        }
      }

      if (!resource.assignedIncident) {
        return res
          .status(400)
          .json({ message: "Resource is not currently assigned to any incident" });
      }

      const incident = await Incident.findById(resource.assignedIncident);
      if (incident) {
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

        // Log in incident
        incident.activityLog.push({
          action: "Resource Released",
          performedBy: req.user._id,
          performedByRole: req.user.role,
          notes: `Resource ${resource.name} (${resource.resourceId}) released from incident.`,
          timestamp: new Date(),
        });
        await incident.save();
      }

      resource.status = "Available";
      resource.resourceActivityLog.push({
        action: "Released From Incident",
        performedBy: req.user._id,
        performedByRole: req.user.role,
        notes: incident
          ? `Manually released from incident ${incident.incidentNumber}.`
          : "Released from incident.",
        timestamp: new Date(),
      });

      resource.assignedIncident = undefined;
      resource.assignedTo = undefined;

      await resource.save();
      res.status(200).json(resource);
    } catch (error: any) {
      console.error("Error releasing resource:", error);
      res.status(500).json({ message: "Server error releasing resource", error: error.message });
    }
  },
);

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Authority, Admin)
router.delete(
  "/:id",
  protect,
  authorize("authority", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const resource = await Resource.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Jurisdiction check
      if (req.user.role === "authority") {
        if (
          resource.managedByState !== req.user.state ||
          resource.managedByDistrict !== req.user.district
        ) {
          return res
            .status(403)
            .json({ message: "Not authorized to delete resources outside your jurisdiction" });
        }
      }

      await resource.deleteOne();
      res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ message: "Server error deleting resource", error: error.message });
    }
  },
);

export default router;
