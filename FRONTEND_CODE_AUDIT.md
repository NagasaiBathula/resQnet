# Frontend Code Audit: ResQNet AI
*Prepared by Agent 2 — Frontend Code Auditor*

This document audits the frontend architecture, state management, routes, and services of the ResQNet AI React application.

---

## 1. Frontend Tech Stack

- **Core**: React 19 (compiled with Vite)
- **Routing**: `@tanstack/react-router` (type-safe file-based routing)
- **Styling**: Tailwind CSS v4, Lucide React icons, Radix UI components (primitives for dialogues, dropdowns, popovers)
- **Charts**: `recharts` for dashboard analytics
- **Map rendering**: `leaflet` and `react-leaflet` for visual coordination

---

## 2. Compile and Build Verification

We executed `npm run build` in the root folder. The build completed successfully:
- **Client Bundling**: Vite successfully compiled the React application and outputted minified static assets to `dist/client/`.
- **SSR Server Bundling**: Vite compiled the server-side SSR wrapper to `dist/server/`.

### Chunk Size Analysis & Optimization
During build, Vite outputted the following warning:
```
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
```
The chunks causing this are:
- `dist/client/assets/leaflet-map-BLDPyWX6.js` (159.23 kB)
- `dist/client/assets/generateCategoricalChart-BOEt1hk1.js` (383.87 kB)
- `dist/client/assets/index-CKUeg-KJ.js` (675.94 kB)

**Recommendation**: Use dynamic `React.lazy` or TanStack Router lazy loading for dashboards and leafet map components to reduce the initial bundle weight (`index-CKUeg-KJ.js`).

---

## 3. Services and API Integration Review

### Hardcoded URLs Check
- **Centralized Config**: Audited all component and route files. All requests route through a centralized configurations service:
  - [config.ts](file:///d:/resqnetai-main/src/lib/config.ts) resolves the target URL:
    ```typescript
    export const API_URL = import.meta.env.VITE_API_URL || "";
    ```
  - In development, fallback is `""` (relative URL pointing to the unified dev server).
  - In production, it targets the Render API URL.
- **Pass**: No hardcoded `http://localhost:5000` URLs are present in the frontend source code folder (`src/`).

### Route Structure
Guarded routing is managed cleanly under `src/routes/` using parent layout route files:
- `admin.tsx` wraps all admin dashboards.
- `authority.tsx` wraps authority commands.
- `rescue.tsx` wraps rescue squad operations.
- `volunteer.tsx` wraps volunteer dispatches.

These layout files check the user role in `AuthContext` and redirect unauthorized attempts, preventing client-side route privilege escalation.

---

## 4. Runtime Risks & Error Handling

- **Leaflet SSR Checks**: Standard Leaflet tries to access browser globals (`window`, `document`) on load, which can crash Node SSR. The application uses dynamic importing and client checks to safely render leaflet maps only on the client.
- **API Failures**: Component actions are wrapped in state hooks (e.g. `isLoading`, `error` states). Toasts (`sonner`) notify the user of login failures or dispatch issues.
- **TypeScript Compliance**: Verified `npx tsc --noEmit` on the client files, returning zero type warnings.
