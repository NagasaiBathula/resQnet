export const INCIDENT_STATUS = {
  REPORTED: "Reported",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
} as const;

export type IncidentStatusType = typeof INCIDENT_STATUS[keyof typeof INCIDENT_STATUS];

export const VALID_TRANSITIONS: Record<IncidentStatusType, IncidentStatusType[]> = {
  [INCIDENT_STATUS.REPORTED]: [INCIDENT_STATUS.VERIFIED, INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.VERIFIED]: [INCIDENT_STATUS.ASSIGNED, INCIDENT_STATUS.IN_PROGRESS, INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.ASSIGNED]: [INCIDENT_STATUS.IN_PROGRESS, INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.IN_PROGRESS]: [INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.RESOLVED]: [], // Terminal state
};

export function isValidTransition(from: IncidentStatusType, to: IncidentStatusType): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
