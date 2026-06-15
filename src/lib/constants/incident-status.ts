export const INCIDENT_STATUS = {
  REPORTED: "Reported",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
} as const;

export type IncidentStatusType = (typeof INCIDENT_STATUS)[keyof typeof INCIDENT_STATUS];

export const VALID_TRANSITIONS: Record<IncidentStatusType, IncidentStatusType[]> = {
  [INCIDENT_STATUS.REPORTED]: [INCIDENT_STATUS.VERIFIED, INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.VERIFIED]: [
    INCIDENT_STATUS.ASSIGNED,
    INCIDENT_STATUS.IN_PROGRESS,
    INCIDENT_STATUS.RESOLVED,
  ],
  [INCIDENT_STATUS.ASSIGNED]: [INCIDENT_STATUS.IN_PROGRESS, INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.IN_PROGRESS]: [INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.RESOLVED]: [],
};

export function getStatusBadgeTone(
  status: string,
): "info" | "primary" | "warning" | "success" | "muted" {
  switch (status) {
    case INCIDENT_STATUS.REPORTED:
      return "info";
    case INCIDENT_STATUS.VERIFIED:
      return "primary";
    case INCIDENT_STATUS.ASSIGNED:
      return "warning";
    case INCIDENT_STATUS.IN_PROGRESS:
      return "warning";
    case INCIDENT_STATUS.RESOLVED:
      return "success";
    default:
      return "muted";
  }
}
