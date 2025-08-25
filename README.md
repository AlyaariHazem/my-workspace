# MyWorkspace

Monorepo that contains the **`grid-formatters`** Angular library:
- Reusable **Settings** UI to pick Date/Time formats (with “Apply”).
- A **SettingsService** that persists to `localStorage` and emits changes via `BehaviorSubject`.
- AG Grid cell renderers that re-render automatically when formats change.

> Works with Angular **v18–20**, AG Grid **v31–32**, PrimeNG **v17**.

---

## Packages

projects/
└─ grid-formatters/
├─ src/lib/
│ ├─ settings/
│ │ ├─ settings.component.ts # Settings UI (standalone)
│ │ └─ settings.module.ts # Thin NgModule wrapper for non-standalone apps
│ ├─ ag-base-format-renderer.ts # Base renderer (rxjs + OnPush)
│ ├─ date-cell-renderer.component.ts
│ ├─ time-only-cell-renderer.component.ts
│ ├─ date-or-datetime-cell-renderer.component.ts
│ ├─ ag-format.types.ts
│ └─ settings.service.ts # BehaviorSubject store (+localStorage)
└─ public-api.ts # Library exports
