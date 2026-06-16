# Dependency Audit Report — ResQNet AI

This report details the audit of dependencies defined in the root and server `package.json` files of the ResQNet AI repository, highlighting removed unused libraries and confirming the production-ready list.

## Frontend Dependencies Audit (Root `package.json`)

We scanned the entire `src/` codebase for imports referencing the package lists and identified 15 completely unused dependencies (primarily originating from unused Shadcn UI components that were cleaned up in Phase 1).

### Removed Dependencies (Unused)
- `@radix-ui/react-accordion` (not imported anywhere)
- `@radix-ui/react-aspect-ratio` (not imported anywhere)
- `@radix-ui/react-collapsible` (not imported anywhere)
- `@radix-ui/react-context-menu` (not imported anywhere)
- `@radix-ui/react-hover-card` (not imported anywhere)
- `@radix-ui/react-menubar` (not imported anywhere)
- `@radix-ui/react-navigation-menu` (not imported anywhere)
- `@radix-ui/react-scroll-area` (not imported anywhere)
- `@radix-ui/react-slider` (not imported anywhere)
- `@radix-ui/react-toggle` (not imported anywhere)
- `@radix-ui/react-toggle-group` (not imported anywhere)
- `embla-carousel-react` (not imported anywhere)
- `input-otp` (not imported anywhere)
- `react-resizable-panels` (not imported anywhere)
- `vaul` (not imported anywhere)

### Retained Core UI & Utility Dependencies
- `@radix-ui/react-alert-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip` (Used by active UI elements)
- `leaflet` & `react-leaflet` (Used for real-time operations mapping)
- `recharts` (Used for dashboard statistics and analytics charts)
- `framer-motion` & `tw-animate-css` (Used for micro-animations and transitions)
- `lucide-react` (Used for system icons)
- `react-hook-form` & `@hookform/resolvers` & `zod` (Used for form handling and validation)

---

## Backend Dependencies Audit (`server/package.json`)

All dependencies listed in `server/package.json` are actively utilized by the backend Express server:
- `@google/genai` & `@google/generative-ai` (Gemini integration, live chats, AI incident triage)
- `mongoose` (MongoDB data modeling)
- `express`, `cors` (API server and routing)
- `bcryptjs`, `jsonwebtoken` (Secure authentication & role authorization)
- `dotenv` (Environment configurations)

## Status

**Phase 4 (Dependency Audit) is complete.** The project's dependency definition files are clean and optimized for production deployment, and `node_modules` remains intact.
