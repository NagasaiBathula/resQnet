# Unused Files Report: ResQNet AI
*Prepared by Phase 1 — Dead File Audit*

This document lists all files that were identified as dead code, temporary artifacts, or unused UI scaffolding and have been safely removed from the repository.

| File Path | Why it is Unused | Safe to Remove? |
| :--- | :--- | :--- |
| `src/components/data-page.tsx` | UI component with generic layout; never imported or used. | **Yes** |
| `src/lib/api/example.functions.ts` | Placeholder template for API endpoints; never imported. | **Yes** |
| `server/src/test-conn.ts` | Temporary diagnostic script to debug database connection. | **Yes** |
| `server/src/test-gemini.ts` | Temporary verification script for the Gemini API. | **Yes** |
| `scratch/test-db.js` | Temporary development test script to verify MONGODB_URI. | **Yes** |
| `scratch/test-dexie.js` | Temporary test script for local IndexedDB cache. | **Yes** |
| `src/components/ui/accordion.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/aspect-ratio.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/breadcrumb.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/carousel.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/collapsible.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/context-menu.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/drawer.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/hover-card.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/input-otp.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/menubar.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/navigation-menu.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/pagination.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/resizable.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/scroll-area.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/slider.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/toggle.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |
| `src/components/ui/toggle-group.tsx` | Part of generic UI scaffolding; never imported or used. | **Yes** |

---

### Verification Status
*   **Total Files Removed**: 23
*   **Workflows Affected**: None. All core routing layouts and page components continue to compile successfully.
