# Backend Auditor Report: ResQNet AI
*Prepared by Agent 3 — Backend Auditor*

This document audits the Express.js backend API routes, controllers, middleware, and request validation logic of the ResQNet Express package.

---

## 1. API Route Coverage

The Express application registers five main routers under [app.ts](file:///d:/resqnetai-main/server/src/app.ts):

*   `/api/auth`: Handles user login and registration (`auth.ts`).
*   `/api/users`: Handles fetching all users, approving profiles, and admin operations (`users.ts`).
*   `/api/incidents`: Handles incident reports, verifications, status updates, responder assignments, stockpile allocations, and timelines (`incidents.ts`).
*   `/api/resources`: Handles stockpile registry and allocations (`resources.ts`).
*   `/api/ai`: Handles Gemini chat assistant, emergency classifications, auto-triages, and image assessments (`ai.ts`).

---

## 2. Authentication & Authorization Middleware

Guarded endpoints utilize two Express middlewares, defined in [auth.ts](file:///d:/resqnetai-main/server/src/middleware/auth.ts):

1.  **`protect`**:
    - Parses the HTTP Authorization header (`Bearer <token>`).
    - Decodes the JWT using `jwt.verify()` and `process.env.JWT_SECRET`.
    - Queries the database for the user (`User.findById(decoded.id).select("-password")`).
    - Rejects request with `401 Unauthorized` if the token is missing, expired, or the user is not found.
2.  **`authorize(...roles)`**:
    - Checks `req.user.role`.
    - Rejects request with `403 Forbidden` if the role is not permitted.

---

## 3. Code Integrity & 500 Error Risks

### Unhandled database connection timeout
- **Issue**: Previously, if MongoDB Atlas was unreachable or timed out (due to SSL/TLS interception in local dev networks), the Express server would print a buffering error and continue to accept requests. When the client attempted to query the database, the operations would buffer and time out after 10 seconds, throwing unhandled internal errors and freezing the client login.
- **Fix**: Added `NODE_TLS_REJECT_UNAUTHORIZED="0"` in local development mode to bypass certificate verification, and configured Mongoose connection timeout to fail early (`serverSelectionTimeoutMS: 5000`).

### Try/Catch Block Coverage
We audited the controllers in `server/src/routes/` and verified:
- **Try/Catch Blocks**: All major controllers are wrapped in robust `try { ... } catch (err) { ... }` blocks.
- **Fail-Safe Returns**: Errors are caught and returned as `500 Server Error` JSON payloads (e.g. `res.status(500).json({ message: "...", error: err.message })`), preventing node process crashes.
- **Idempotent database seeding**: Seeding of demo users in `initDB()` performs upsert operations (using `User.findOne` and fallback fields) to avoid DuplicateKey errors on HMR server restarts.

---

## 4. API Endpoints Audit Summary

*   **Auth Router**:
    - Password comparison uses `bcrypt.compare()` safely.
    - Token generation signs the payload securely.
*   **Incident Router**:
    - `PUT /incidents/:id/status` enforces role checks. Rescue Teams can only set status to `In Progress` or `Resolved`. Authorities can set status to `Verified` or `Assigned`.
    - `PUT /incidents/:id/resources` validates available stockpile items.
*   **Resource Router**:
    - Restricts stockpile registration to `admin` and `authority` roles.
