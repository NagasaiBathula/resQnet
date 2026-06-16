# Deployment Auditor Report: ResQNet AI
*Prepared by Agent 7 — Deployment Auditor*

This document audits the production deployment topology, environments, build configuration parameters, and startup scripts of the ResQNet AI platform.

---

## 1. Hosting Topology

ResQNet AI is split into a client-server architecture:

```
[Vercel Hosting]                 [Render Hosting]              [MongoDB Atlas]
React Client / Vite    ───HTTPS───> Express API Server  ───TCP───> Database Cluster
(Port 8080 local)                (Port 5000 local)             (Port 27017)
```

- **Frontend**: Deployed on **Vercel** as a static Single Page Application (SPA).
- **Backend**: Deployed on **Render** as a long-running Node Web Service.
- **Database**: Managed on **MongoDB Atlas** (Free or Shared tier).
- **AI**: Integrates with Google AI Studio's **Gemini 2.5 Flash** endpoints.

---

## 2. Compile and Build Diagnostics

We ran typechecking and build verification scripts:

### A. TypeScript Typechecking
- **Command**: `npx tsc --noEmit` in both the root directory and the `server` directory.
- **Root Typecheck**: **Pass** (compiled cleanly after fixing an implicit `any` parameter type on the database initializer error handler inside [vite.config.ts](file:///d:/resqnetai-main/vite.config.ts)).
- **Server Typecheck**: **Pass** (zero warnings or compilation errors).

### B. Client Compilation
- **Command**: `npm run build`
- **Build Output**: Successfully compiled React static bundles into `dist/client/` and server SSR entry to `dist/server/`.

---

## 3. Environment Variable Audit

We checked that the necessary environment variables are documented and configured:

| Target | Variable Name | Purpose | Setup Checklist |
| :--- | :--- | :--- | :--- |
| **Vercel** | `VITE_API_URL` | Endpoint of the Render backend server. | Ensure it has no trailing slash. |
| **Render** | `MONGODB_URI` | MongoDB Atlas cluster connection string. | Must include correct password URL-encoded. |
| **Render** | `GEMINI_API_KEY` | Developer key from Google AI Studio. | Key must start with `AQ.`. |
| **Render** | `JWT_SECRET` | Secret hash to sign token signatures. | Use a secure random string. |
| **Render** | `FRONTEND_URL` | CORS whitelisted frontend domain. | Must match Vercel deployment URL. |

---

## 4. SPA Router Configuration (Vercel)

Because TanStack Router manages page transitions inside the browser, refreshing paths like `/citizen/report` directly on Vercel will trigger `404 Not Found` unless Vercel redirects those paths back to `/index.html`.
- **Fix**: Framework preset `Vite` handles this, or you can add a `vercel.json` rewrite:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/" }
    ]
  }
  ```
