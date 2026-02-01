# Angular Libraries Monorepo

A curated collection of production-ready Angular libraries designed to accelerate enterprise application development. This monorepo houses specialized, reusable Angular libraries that solve common challenges in data-intensive applications, particularly those working with AG Grid, internationalization, and API integration.

---

## 🎯 Monorepo Philosophy

This workspace follows a **focused library approach**, where each library:
- **Solves a specific problem domain** rather than being a catch-all utility package
- **Maintains zero coupling** with other libraries (no cross-dependencies)
- **Provides standalone components** compatible with modern Angular (v18+)
- **Ships with comprehensive TypeScript types** for excellent IDE support
- **Follows semantic versioning** and can be independently published to npm

### Intended Audience

- **Angular developers** building data-driven enterprise applications
- **Teams using AG Grid** who need flexible, user-configurable formatting
- **Organizations serving international markets** requiring Hijri calendar support
- **Projects with microservice architectures** needing consistent API integration patterns

---

## 📦 Libraries Overview

This monorepo contains **three specialized libraries**, each addressing a distinct aspect of Angular application development:

---

## 🔹 ag-grid-formatters

**Package:** `ag-grid-formatters`  
**Published as:** `ag-grid-formatters` on npm

### What It Solves

Formatting dates, times, and currencies in AG Grid is tedious and often hard-coded. When users need different date formats (US vs. European) or currency displays, developers end up writing custom renderers for every column. This library eliminates that boilerplate by providing **smart cell renderers** that automatically respond to user-selected format preferences.

### When to Use It

- ✅ Building dashboards or reports with **AG Grid** that display dates, times, or currencies
- ✅ Applications serving **multiple regions** with different date/time formatting preferences
- ✅ Projects where **end users should control** how dates and currencies appear (without code changes)
- ✅ Teams needing **cross-tab synchronization** of format settings via localStorage
- ✅ Scenarios requiring **Hijri (Islamic) calendar** support alongside Gregorian dates

### Features

- **Ready-to-Use Cell Renderers** for AG Grid columns:
  - Date-only renderer (`DateCellRenderer`)
  - Time-only renderer (`TimeOnlyCellRenderer`)
  - Date+Time combo renderer (`DateOrDatetimeCellRenderer`)
  - Currency renderer with locale support (`CurrencyCellRenderer`)
- **Global Settings Component** — Standalone UI panel allowing users to select date/time/currency formats with live preview
- **Persistent User Preferences** — Settings automatically saved to `localStorage` and restored on page reload
- **Cross-Tab Synchronization** — Format changes in one browser tab instantly reflect in all other open tabs
- **Reactive Updates** — Renderers use RxJS to re-render grid cells when formats change (no page refresh needed)
- **Hijri Calendar Integration** — Optional support for Islamic calendar dates using `moment-hijri`
- **Utility Functions & Pipes** — Reusable date/time formatting utilities for use outside AG Grid
- **Standalone Components** — No module imports required; works with standalone Angular apps
- **TypeScript First** — Comprehensive type definitions for all APIs

**Compatibility:** Angular 18–20, AG Grid 31–32, PrimeNG 17

---

## 🔹 hijiri-calendar

**Package:** `hijiri-calendar`  
**Published as:** `hijiri-calendar` on npm

### What It Solves

Many applications serving Muslim-majority regions need to support the **Hijri (Islamic) calendar** for date inputs, but Angular's built-in date handling only supports Gregorian dates. This library provides a production-ready Hijri date picker with robust validation, seamless conversion between Hijri/Gregorian formats, and integration with Angular's reactive forms.

### When to Use It

- ✅ Applications targeting **Middle Eastern or Muslim-majority markets**
- ✅ Forms requiring **Hijri date inputs** (birth dates, contract dates, event scheduling)
- ✅ Projects needing **bidirectional Hijri ↔ Gregorian conversion** for API communication
- ✅ Teams building government or compliance systems in **Saudi Arabia, UAE, or similar regions**
- ✅ Applications where backend expects **Gregorian dates** but UI must display Hijri

### Features

- **Hijri Date Field Component** — Ready-to-use `<lib-hijri-date-field>` component for Angular forms
- **Strong Validation** — Built-in validators for:
  - Required fields
  - Correct Hijri format (`DD/MM/YYYY` → `10/04/1447`)
  - Real Hijri dates (prevents invalid dates like `32/13/1447`)
  - Min/Max range validation
- **Dual-Format Output** — Send dates to backend as either:
  - Hijri format: `iYYYY-iMM-iDD`
  - Gregorian format: `YYYY-MM-DD`
- **Angular Material Integration** — Optional Material Design styling
- **Syncfusion Calendar Support** — Optional integration with Syncfusion date pickers
- **Powered by moment-hijri** — Reliable date conversion using the established `moment-hijri` library
- **Reactive Forms Ready** — Full `ControlValueAccessor` implementation for seamless form integration
- **TypeScript Support** — Complete type definitions for all date operations

**Compatibility:** Angular 18+, moment 2.30+, moment-hijri 2.30+

---

## 🔹 hireme-shared

**Package:** `hireme-shared`  
**Internal library** (not published to npm)

### What It Solves

When building Angular applications with **microservice architectures**, teams often duplicate API integration logic across multiple apps. This library provides a **reusable pattern** for API calls using dependency injection, making it easy to configure different API endpoints per environment while keeping service code DRY.

### When to Use It

- ✅ Projects with **multiple Angular applications** calling the same backend services
- ✅ Teams wanting a **consistent API integration pattern** across apps
- ✅ Applications using **environment-based configuration** for API URLs
- ✅ Scenarios requiring **shared user profile fetching** logic

### Features

- **UserService** — Injectable service for fetching user profiles with automatic caching via RxJS `shareReplay`
- **Dependency Injection Tokens** — `GET_URL` token for environment-specific API URL resolution
- **Flexible API Configuration** — Generic `GetUrlFn` signature: `(method: string, module_entity?: string) => string`
- **RxJS Best Practices** — Observable caching prevents redundant API calls for user profile data
- **Minimal Dependencies** — Only requires Angular Core and Common modules

**Compatibility:** Angular 19+

---

## 🛠️ Development

### Building Libraries

```bash
# Build all libraries
npm run build

# Build specific library
ng build grid-formatters
ng build hijri-date
ng build hireme-shared
```

### Testing

```bash
# Run tests for all libraries
npm test

# Run tests for specific library
ng test grid-formatters
```

### Local Development

Each library can be developed independently. Changes are immediately reflected in the demo application (where applicable).

---

## 📄 License

MIT

---

## 🤝 Contributing

This is an internal monorepo. For questions or contributions, please contact the maintainer.

---

## 📚 Additional Resources

- [AG Grid Documentation](https://www.ag-grid.com/angular-data-grid/)
- [moment-hijri Documentation](https://github.com/xsoh/moment-hijri)
- [Angular Libraries Guide](https://angular.dev/tools/libraries)
