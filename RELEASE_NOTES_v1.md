# ResQNet AI v1.0.0 - Release Notes

Welcome to the official **ResQNet AI v1.0.0** production release. ResQNet is a unified crisis coordination platform connecting citizens, emergency response command centers, rescue teams, and volunteers in real time.

---

## 1. Overview
ResQNet simplifies disaster response by providing an incident-centric coordination workspace. It utilizes Google Gemini AI to auto-triage reports and assess structural damage, facilitating rapid assignment of rescue squads, volunteers, and stockpile resources.

---

## 2. Completed Features

### 🔐 User & Roster Management
*   **Authentication**: Secure, token-based authorization and session state management.
*   **Role Management**: Strict permission routing and specialized dashboards for five distinct roles:
    *   **Citizen**: Report disasters, chat with AI for first-aid instruction.
    *   **Authority**: Dispatch commands, verify incidents, assign teams.
    *   **Rescue Team**: Actionable field missions and resolution logging.
    *   **Volunteer**: Community dispatches and task lists.
    *   **Admin**: System registries, user approvals, and global settings.

### 🗺️ Emergency Maps & Locations
*   **Leaflet Mapping**: Interactive maps clustering incidents and assets.
*   **Location Selectors**: Standardized state and district jurisdiction boundaries.

### 📋 Incident & Resource Lifecycle
*   **Incident Workspace**: Split-pane, status-driven dispatch console for Authorities.
*   **Dispatch Orchestration**: Assign rescue team, volunteer, and stockpile assets simultaneously on incident verification.
*   **Resource Management**: Register, update, transfer, and track stockpile equipment.
*   **Automatic Lifecycles**: Allocated stockpile assets are automatically locked to active incidents and released back to `Available` on operational resolution.

### 🤖 Google Gemini AI Integration
*   **Gemini Assistant**: Chatbot providing Markdown disaster safety and first-aid checklists.
*   **Incident Auto-Triage**: Auto-populates categories, urgency levels, and titles.
*   **Priority Mapping**: Deterministically maps severity to priority levels (`Critical` -> `P1`, `High` -> `P2`, `Medium` -> `P3`, `Low` -> `P4`).
*   **Vision Damage Assessment**: Analyzes photos to identify structural compromise, hazards, and roadblocks.
*   **Fail-Safe Mode**: Automatic rule-based mock fallbacks in case of API request rate limits or service outages.

---

## 3. Deployment Topology
*   **Frontend**: Hosted on **Vercel** (Vite Single Page Application with server-side rewrites to `index.html`).
*   **Backend**: Hosted on **Render** (Express.js Node service with TypeScript runtime).
*   **Database**: **MongoDB Atlas** (Mongoose schema persistence).
*   **AI Engine**: **Google Gemini 2.5 Flash** (via `@google/genai` client).

---

## 4. Known Limitations
*   **Online-First**: Requires active internet connection. Offline storage layers have been removed for MVP stability.
*   **No Push Notifications**: User check-ins are polling-based.
*   **No WebSockets**: Live incident list refreshes are handled through query refetch triggers.

---

## 5. Future Scope & Roadmap
*   **Offline Mode**: Re-implement service worker asset caching and Dexie.js local database caching.
*   **Push Notifications**: Mobile and browser-native push alerts for weather advisories.
*   **Realtime Communication**: WebSocket or SSE integration for active incident panels.
*   **Mobile Companion App**: Native React Native or Flutter app for field responders.
