# Database Auditor Report: ResQNet AI
*Prepared by Agent 4 — Database Auditor*

This document audits the database schemas, Mongoose models, data references, indexes, and lifecycle consistency configurations of the ResQNet MongoDB database.

---

## 1. Mongoose Schemas Auditing

We analyzed the three core Mongoose models located in `server/src/models/`:

### A. User Schema ([User.ts](file:///d:/resqnetai-main/server/src/models/User.ts))
*   **Unique Index**: Enforced on the `email` field with `unique: true`, `lowercase: true`, and `trim: true`.
*   **Role Validation**: Enforces string enums: `citizen`, `volunteer`, `rescue`, `authority`, `admin`.
*   **Idempotency Pre-Save Hook**:
    ```typescript
    userSchema.pre("save", function (next) {
      if (!this.serviceAreaState) this.serviceAreaState = this.state;
      if (!this.serviceAreaDistrict) this.serviceAreaDistrict = this.district;
      next();
    });
    ```
    Automatically populates service areas for newly registered users.

### B. Incident Schema ([Incident.ts](file:///d:/resqnetai-main/server/src/models/Incident.ts))
*   **Human-Friendly Identifiers**: Implements a `pre("save")` hook that counts the active incidents and generates a sequential, readable ID (e.g. `INC-2026-0023`).
*   **State & Category Boundaries**: Category is restricted via enums (`Flood`, `Fire`, `Medical Emergency`, etc.), and severity is bound to `Low`, `Medium`, `High`, `Critical`.
*   **References**: Correctly references the `User` collection for the reporter (`reportedBy`), assigned rescue team (`assignedRescueTeam`), and assigned volunteers (`assignedVolunteers`).
*   **Audit Activity Logging**: Sub-schema `activityLog` tracks a complete timeline of historical transitions, including action types, user IDs, roles, and comments.

### C. Resource Schema ([Resource.ts](file:///d:/resqnetai-main/server/src/models/Resource.ts))
*   **Status Tracking**: Enforces enums: `Available`, `Allocated`, `Maintenance`.
*   **Incident Reference**: Stores a reference to the active `assignedIncidentId` when allocated.

---

## 2. Roster and Stockpile Lifecycle Consistency

We audited the resource allocation and release endpoints inside the backend code:

```
[Resource Allocation Flow]
Authority allocates resource (RES-XXXX) to Incident (INC-XXXX)
  ↓
Resource status changed to 'Allocated' in Resource collection
  ↓
Incident's 'allocatedResources' array receives resource metadata
  ↓
Resource status is locked (cannot be allocated elsewhere)
```

```
[Resource Release Flow]
Rescue Team resolves Incident (INC-XXXX)
  ↓
Incident status changed to 'Resolved'
  ↓
Query incident's 'allocatedResources' array for resource IDs
  ↓
For each resource ID, set status back to 'Available' and clear 'assignedIncidentId'
```

### Findings
- **Consistency**: The database successfully maintains consistency between the Resource status and Incident state.
- **Timeline Persistence**: Status transitions are logged to the `activityLog` array of the incident schema, preserving the operational history.
- **Index Optimization**: Indices are set on `email` (User) and `incidentNumber` (Incident) for low latency lookup. We recommend adding an index on `status` and `assignedRescueTeam` for faster dashboard loading.
