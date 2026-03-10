# Vite Configuration for ag-grid-currency-formatter

If you're using Vite (or Angular with Vite) and encountering the error:
```
Missing "./overlaypanel" specifier in "primeng" package
```

Add this configuration to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['ag-grid-currency-formatter'],
    include: [
      'primeng/overlaypanel',
      'primeng/listbox',
      'primeng/button'
    ]
  }
});
```

Or, if you're using Angular's build system with Vite, add this to your `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "optimization": {
              "scripts": false
            }
          }
        }
      }
    }
  }
}
```

Alternatively, you can exclude the package from optimization entirely:

```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['ag-grid-currency-formatter']
  }
});
```
