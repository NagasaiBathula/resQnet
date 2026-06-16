# ResQNet Frontend: Vercel Deployment Guide

This document outlines the step-by-step instructions to deploy the ResQNet React/Vite/TanStack Start client on **Vercel**.

---

## 1. Vercel Project Configuration

Follow these settings when creating a new **Project** on the Vercel Dashboard:

| Field | Configuration | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | Configures Vercel's build pipeline for Vite bundling |
| **Build Command** | `npm run build` | Compiles frontend assets |
| **Output Directory** | `dist/client` | Specifies where the build assets are compiled |

---

## 2. Environment Variables Setup

Configure the following environment variables under the **Environment Variables** tab of the Vercel Project settings:

| Key | Example Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://resqnet-api.onrender.com` | Base URL of the deployed Render Express backend API |

---

## 3. Dynamic API Routing & config

Ensure that [config.ts](file:///d:/resqnetai-main/src/lib/config.ts) is properly configured to dynamically resolve the backend path:
```typescript
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```
When Vercel builds the project, Vite injects the value of `VITE_API_URL` into `import.meta.env.VITE_API_URL`.

---

## 4. Router Navigation Fallback (Single Page Application configuration)

Since TanStack Router runs client-side route paths, refreshing routes like `/citizen` directly on Vercel can cause `404 Not Found` errors if Vercel attempts to load `/citizen/index.html` from the file system.

To prevent this, Vercel routes all navigation paths back to the `/` root document. Vercel does this automatically when the Framework Preset is set to `Vite`, or you can enforce it by adding a `vercel.json` file in the root directory:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 5. Common Deployment Issues & Resolutions

### A. CORS Exceptions
*   **Cause**: The Render API backend is blocking the Vercel site's domain.
*   **Fix**: Update the `FRONTEND_URL` environment variable on the Render Web Service to match your deployed Vercel domain (e.g., `https://resqnet.vercel.app`).

### B. Map Icons or Assets Missing
*   **Cause**: Relative links or paths are incorrectly resolved.
*   **Fix**: All static assets (icons, stylesheets, screenshots) must be placed in the `public` directory so they are compiled to the root of the build output (`dist/client/`).

### C. Build fails with TypeScript Errors
*   **Cause**: Unresolved local modules or dependency mismatches in client routing.
*   **Fix**: Verify imports are clean. Run `npx tsc --noEmit` locally before committing to verify zero compile-time errors.
