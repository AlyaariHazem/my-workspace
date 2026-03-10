# Fix for Vite Error in Hire-Me Project

## Step 1: Create vite.config.ts

Create a file named `vite.config.ts` in the root of your `Hire-Me` project (same level as `package.json`) with this content:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['ag-grid-currency-formatter']
  }
});
```

## Step 2: Restart Dev Server

After creating the file, restart your Angular dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
ng serve
```

## Alternative: If vite.config.ts doesn't work

If Angular 20 doesn't pick up `vite.config.ts`, you can try adding this to your `angular.json` under your project's build options:

```json
{
  "projects": {
    "hire-me": {
      "architect": {
        "build": {
          "options": {
            "externalDependencies": [
              "ag-grid-currency-formatter"
            ]
          }
        }
      }
    }
  }
}
```

## Why this works

The error occurs because Vite tries to pre-bundle all dependencies, including `ag-grid-currency-formatter`. When it encounters the PrimeNG subpath imports (`primeng/overlaypanel`), it can't resolve them during pre-bundling.

By excluding `ag-grid-currency-formatter` from Vite's optimization, the package will be loaded at runtime when PrimeNG is already available, avoiding the resolution error.
