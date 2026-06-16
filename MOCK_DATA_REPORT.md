# Mock Data Audit Report — ResQNet AI

This report details the audit of mock datasets defined in `src/lib/mock-data.ts` and their utilization within the ResQNet AI application.

## Audit Summary

- **Demo User Accounts:**
  - Configured in `src/lib/mock-data.ts` as `demoUsers` using `.app` email domains.
  - Active authentication uses `.ai` domains defined in `server/src/app.ts` and `src/lib/auth.tsx`.
  - Both configurations successfully map to the core MVP demo personas:
    - **Citizen:** Aarav Sharma (`citizen@resqnet.ai`)
    - **Volunteer:** Priya Patel (`volunteer@resqnet.ai`)
    - **Rescue Team:** Cmdr. Rohan Mehta (`rescue@resqnet.ai`)
    - **Authority:** Dr. Anita Rao (`authority@resqnet.ai`)
    - **Admin:** System Admin (`admin@resqnet.ai`)
  - **Verdict:** Personas are retained in full to support the "One-Click Demo" jump-roles and E2E verification suites.

- **Incidents, Shelters, and Missions Mock Data:**
  - Mock datasets (`incidents`, `shelters`, `missions`) are generated programmatically using deterministic coordinate offsets clustered around main Indian cities (Mumbai, Chennai, etc.).
  - They are used as critical fallbacks, analytics inputs, and initial hydration states across map routes, history view routes, and simulation dashboards.
  - **Verdict:** Retained in full to ensure operational simulation capability without breaking frontend dashboards.

- **AI Suggested Prompts and Mock Generator:**
  - `aiSuggestedPrompts` and `generateAIResponse` are preserved to support offline/fallback AI chat modes when `GEMINI_API_KEY` is not present in the environment.

## Status

**Phase 5 (Mock Data Audit) is complete.** Necessary demo accounts and programmatic datasets have been validated and preserved to maintain full system functionality and demo-readiness.
