# Security Auditor Report: ResQNet AI
*Prepared by Agent 6 — Security Auditor*

This document presents a code-level security audit focusing on user credentials, JSON Web Tokens (JWT), route-level authorization, CORS protection, and potential privilege escalation vulnerabilities.

---

## 1. Credentials and Hashing

- **Password Hashing**: User registration in [auth.ts](file:///d:/resqnetai-main/server/src/routes/auth.ts) hashes plain passwords before database write using:
  ```typescript
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  ```
- **Login Verification**: Safe comparison is handled via `bcrypt.compare(password, user.password)`.
- **Credential Safety**: We performed a directory-wide scan and verified that no developer credentials, MongoDB URI connection strings, or JWT secrets are hardcoded in the source files.

---

## 2. JWT Verification and Token Handling

- **Token signature**: Session tokens are signed using `jwt.sign()` and `process.env.JWT_SECRET`.
- **Parsing**: Middleware `protect` in [auth.ts](file:///d:/resqnetai-main/server/src/middleware/auth.ts) parses the token from `req.headers.authorization`.
- **Storage**: Tokens are stored client-side in the browser's `localStorage` (`resqnet.token`) and sent via the standard `Bearer` prefix in HTTP headers.

---

## 3. CORS and Middleware Whitelisting

- **Old Wildcard CORS**: Wildcard origins (`app.use(cors())`) have been removed, closing a critical security vulnerability that would have allowed any external website to query user details from browser sessions.
- **Hardened CORS**: In [index.ts](file:///d:/resqnetai-main/server/src/index.ts) and [app.ts](file:///d:/resqnetai-main/server/src/app.ts), the whitelist is limited to localhost ports and the production frontend URL:
  ```typescript
  origin: [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:8080",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[]
  ```

---

## 4. Privilege Escalation Analysis

We audited the API controllers to verify if a low-privilege role (like `citizen` or `volunteer`) could perform high-privilege actions (like allocating resources, verifying incidents, or registering authorities):

### Case 1: Status Transitions
- **Endpoint**: `PUT /api/incidents/:id/status`
- **Guards**: Enforces checks within the route:
  - If a user tries to set the status to `Verified` or `Assigned`, the code verifies that `req.user.role === "authority"`.
  - If a user tries to set the status to `In Progress` or `Resolved`, the code verifies that the user is the assigned Rescue Team or an Authority.
- **Result**: **Pass**. Low privilege roles cannot transition status arbitrarily.

### Case 2: Resource Allocations
- **Endpoint**: `PUT /api/incidents/:id/resources`
- **Guards**: Enforces role restrictions at the controller level:
  - Verifies that the requester role is `authority` or `admin`.
- **Result**: **Pass**.

### Case 3: Roster and Roster Verification
- **Endpoint**: `PUT /api/users/:id/status` (User approval)
- **Guards**: Enforced via `authorize("admin")` middleware at the route declaration.
- **Result**: **Pass**. Only Admins can approve or reject new responders.
