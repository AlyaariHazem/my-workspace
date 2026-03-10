# ag-grid-currency-formatter

![npm total downloads](https://img.shields.io/npm/dt/ag-grid-currency-formatter)
![npm downloads (month)](https://img.shields.io/npm/dm/ag-grid-currency-formatter)
![npm downloads (year)](https://img.shields.io/npm/dy/ag-grid-currency-formatter)

A focused Angular library providing **AG-Grid currency cell renderer** with multi-currency support, locale-aware formatting, and persistent user preferences.

---

## Features

- 💰 **Currency Cell Renderer** - Multi-currency support with locale-aware formatting for AG-Grid
- 🌍 **Locale Support** - Format currencies according to different locales (en-US, ar-SA, de-DE, etc.)
- 💾 **Persistent Settings** - User currency preferences saved in localStorage
- 🔄 **Cross-tab Synchronization** - Currency changes sync across browser tabs automatically
- 🎨 **Standalone Component** - Standalone component, no module imports needed for the renderer
- ⚙️ **Settings Component** - Optional UI component for currency selection (requires PrimeNG)

---

## Installation

```bash
npm install ag-grid-currency-formatter
```

---

## Peer Dependencies

This library requires the following peer dependencies (you must install them in your application):

```bash
npm install @angular/common@^18.2.13 @angular/core@^18.2.13
npm install ag-grid-angular@^31.3.4 ag-grid-community@^31.3.4
npm install rxjs@^7.8.0
```

**Required dependencies** (for the CurrencyModule UI component):
```bash
npm install primeng@^20.0.0 primeicons@^7.0.0 primeflex@^3.3.1
npm install @angular/router  # Required for CurrencyComponent
```

> **Note:** If you only need `CurrencyCellRendererComponent` (the AG-Grid renderer), you don't need PrimeNG. PrimeNG is only required if you're using `CurrencyModule` and `CurrencyComponent`.

### Vite Configuration (if using Vite)

If you're using Vite and encounter the error `Missing "./overlaypanel" specifier in "primeng" package`, add this to your `vite.config.ts`:

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

This tells Vite to exclude the currency package from pre-bundling and explicitly include PrimeNG subpath exports.

---

## Quick Start

### Currency Cell Renderer

Use the currency cell renderer in your AG-Grid column definitions:

```typescript
import { CurrencyCellRendererComponent } from 'ag-grid-currency-formatter';

// In your component
columnDefs = [
  {
    field: 'amount',
    cellRenderer: CurrencyCellRendererComponent,
    cellRendererParams: {
      // Optional: override currency code and locale per column
      currencyCode: 'USD',      // null = no currency symbol
      locale: 'en-US',           // Locale for number formatting
      // OR use row data:
      currencyField: 'currency', // Field name in row data for currency code
      localeField: 'locale',     // Field name in row data for locale
      // Optional: fraction digits
      minFractionDigits: 0,
      maxFractionDigits: 2,
      useGrouping: true          // Show thousand separators
    }
  }
];
```

### Currency Icon Pipe

Use the `CurrencyIconPipe` in your HTML templates to format numbers with currency icons. **The pipe automatically reads from localStorage** (via `CurrencyService`) to determine which currency and icon to display.

#### Basic Usage (Auto-detects from localStorage)

```typescript
import { CurrencyIconPipe } from 'ag-grid-currency-formatter';

@Component({
  selector: 'app-price',
  standalone: true,
  imports: [CurrencyIconPipe],
  template: `
    <!-- Automatically uses currency from localStorage -->
    <!-- If SAR is stored → shows icon -->
    <!-- If USD is stored → shows $ symbol -->
    <!-- If null → shows plain number -->
    <div [innerHTML]="price | currencyIcon"></div>
  `
})
export class PriceComponent {
  price = 1234.56;
}
```

**How it works:**
1. The pipe reads `selectedCurrencyCode` and `selectedCurrencyLocale` from localStorage
2. If `SAR` is stored → displays the Saudi Riyal icon (`icon-saudi_riyal`)
3. If `USD`, `EUR`, `GBP` is stored → displays standard currency symbol
4. If `null` is stored → displays plain number without currency symbol

#### Override Currency (Ignore localStorage)

```typescript
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CurrencyIconPipe],
  template: `
    <!-- Force USD regardless of localStorage -->
    <div [innerHTML]="price | currencyIcon: { currencyCode: 'USD', locale: 'en-US' }"></div>
    
    <!-- Force SAR with icon -->
    <div [innerHTML]="price | currencyIcon: { currencyCode: 'SAR', locale: 'ar-SA' }"></div>
    
    <!-- Custom formatting -->
    <div [innerHTML]="price | currencyIcon: { 
      currencyCode: 'EUR', 
      minFractionDigits: 2, 
      maxFractionDigits: 2 
    }"></div>
  `
})
export class ProductComponent {
  price = 1234.56;
}
```

#### Complete Example with CurrencyService

```typescript
import { Component, OnInit } from '@angular/core';
import { CurrencyIconPipe } from 'ag-grid-currency-formatter';
import { CurrencyService } from 'ag-grid-currency-formatter';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyIconPipe],
  template: `
    <h2>Checkout</h2>
    <!-- This automatically shows the icon based on what's in localStorage -->
    <p>Total: <span [innerHTML]="total | currencyIcon"></span></p>
    
    <!-- When user changes currency via CurrencyService, this updates automatically -->
    <p>Subtotal: <span [innerHTML]="subtotal | currencyIcon"></span></p>
  `
})
export class CheckoutComponent implements OnInit {
  total = 1500.00;
  subtotal = 1200.00;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    // Set currency (this saves to localStorage)
    this.currencyService.setCurrency('SAR');
    // Now all pipes will show SAR icon automatically!
    
    // Or set to USD
    // this.currencyService.setCurrency('USD');
    // Now all pipes will show $ symbol automatically!
  }
}
```

**Pipe Options:**
- `currencyCode?: string | null` - ISO currency code (e.g., 'SAR', 'USD', 'EUR') or `null` for no symbol. **If not provided, reads from localStorage**
- `locale?: string | null` - BCP 47 locale string (e.g., 'ar-SA', 'en-US'). **If not provided, reads from localStorage**
- `minFractionDigits?: number` - Minimum fraction digits (default: 0)
- `maxFractionDigits?: number` - Maximum fraction digits (default: 2)
- `useGrouping?: boolean` - Show thousand separators (default: true)

**Important Notes:**
- The pipe is **not pure** (`pure: false`), so it automatically updates when currency settings change
- When `currencyCode` is `SAR`, the pipe displays the icon: `<span class="icon-saudi_riyal"></span>`
- The pipe uses `CurrencyService` to read from localStorage, ensuring consistency across your app
- Always use `[innerHTML]` binding because the pipe returns `SafeHtml`

### Currency Service

Use the `CurrencyService` to manage global currency settings:

```typescript
import { CurrencyService, CurrencyOption } from 'ag-grid-currency-formatter';

export class MyComponent {
  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    // Get current currency
    const current = this.currencyService.getCurrency();
    console.log(current.code);    // 'USD' | null
    console.log(current.locale);   // 'en-US' | null
    console.log(current.label);    // 'USD — US Dollar'

    // Set currency
    this.currencyService.setCurrency('EUR');
    // or
    this.currencyService.setCurrency({ code: 'SAR', locale: 'ar-SA', label: 'SAR — Saudi Riyal' });
    // or clear
    this.currencyService.setCurrency(null);

    // Check if currency is set
    if (!this.currencyService.isNone()) {
      const code = this.currencyService.getCurrencyCode();
      const locale = this.currencyService.getCurrencyLocale();
    }
  }
}
```

### Currency Settings Component (Optional)

If you want a UI component for users to select currency, import the `CurrencyModule`:

```typescript
import { CurrencyModule } from 'ag-grid-currency-formatter';

@NgModule({
  imports: [
    CurrencyModule,
    // ... other modules
  ]
})
export class AppModule { }
```

Then use the component in your template:

```html
<app-currency></app-currency>
```

---

## Supported Currencies

The library comes with these pre-configured currencies:

- **None** - No currency symbol (plain number)
- **USD** - US Dollar (en-US)
- **EUR** - Euro (de-DE)
- **GBP** - British Pound (en-GB)
- **SAR** - Saudi Riyal (ar-SA) - Uses special glyph icon

---

## Currency Formatting

The renderer supports various formatting options:

### Per-Column Override

```typescript
{
  field: 'price',
  cellRenderer: CurrencyCellRendererComponent,
  cellRendererParams: {
    currencyCode: 'SAR',
    locale: 'ar-SA',
    minFractionDigits: 2,
    maxFractionDigits: 2
  }
}
```

### Dynamic Currency from Row Data

```typescript
{
  field: 'amount',
  cellRenderer: CurrencyCellRendererComponent,
  cellRendererParams: {
    currencyField: 'currencyCode',  // Reads from row.currencyCode
    localeField: 'currencyLocale'   // Reads from row.currencyLocale
  }
}
```

### No Currency Symbol (Plain Number)

```typescript
{
  field: 'quantity',
  cellRenderer: CurrencyCellRendererComponent,
  cellRendererParams: {
    currencyCode: null,
    locale: 'en-US'
  }
}
```

---

## API Reference

### `CurrencyCellRendererComponent`

Renders currency values in AG-Grid cells.

**Parameters:**
- `currencyCode?: string | null` - ISO currency code (e.g., 'SAR', 'USD', 'EUR') or `null` for no symbol
- `locale?: string` - BCP 47 locale string (e.g., 'ar-SA', 'en-US')
- `currencyField?: string` - Field name in row data for currency code
- `localeField?: string` - Field name in row data for locale
- `minFractionDigits?: number` - Minimum fraction digits (default: 0)
- `maxFractionDigits?: number` - Maximum fraction digits (default: 2)
- `useGrouping?: boolean` - Show thousand separators (default: true)

### `CurrencyIconPipe`

Pipe for formatting numbers with currency icons in HTML templates.

**Usage:**
```html
<div [innerHTML]="amount | currencyIcon"></div>
<div [innerHTML]="amount | currencyIcon: { currencyCode: 'USD', locale: 'en-US' }"></div>
```

**Parameters:**
- `value: number | string | null | undefined` - The number to format
- `options?: CurrencyIconPipeOptions` - Optional formatting options

**Options:**
- `currencyCode?: string | null` - ISO currency code or `null` for no symbol (defaults to CurrencyService)
- `locale?: string | null` - BCP 47 locale string (defaults to CurrencyService)
- `minFractionDigits?: number` - Minimum fraction digits (default: 0)
- `maxFractionDigits?: number` - Maximum fraction digits (default: 2)
- `useGrouping?: boolean` - Show thousand separators (default: true)

**Returns:** `SafeHtml` - Sanitized HTML string that can be used with `[innerHTML]`

**Note:** The pipe is not pure (`pure: false`) because it reads from localStorage and CurrencyService, so it will update when currency settings change.

### `CurrencyService`

Service for managing global currency settings.

**Methods:**
- `getCurrency(): CurrencyOption` - Get current currency option
- `getCurrencyCode(): string | null` - Get current currency code
- `getCurrencyLocale(): string | null` - Get current locale
- `isNone(): boolean` - Check if no currency is selected
- `setCurrency(opt: CurrencyOption | string | null): void` - Set currency

### `CurrencyOption`

```typescript
interface CurrencyOption {
  code: string | null;   // ISO currency code or null
  locale: string | null; // BCP 47 locale or null
  label: string;         // Display label
}
```

---

## Events

The library dispatches custom events for currency changes:

- `currency-format-changed` - Dispatched when currency format changes (same tab)
- `storage` - Browser storage event (cross-tab synchronization)

---

## Examples

### Basic Usage

```typescript
import { CurrencyCellRendererComponent } from 'ag-grid-currency-formatter';

columnDefs = [
  {
    headerName: 'Price',
    field: 'price',
    cellRenderer: CurrencyCellRendererComponent,
    cellRendererParams: {
      currencyCode: 'USD',
      locale: 'en-US'
    }
  }
];
```

### Using Global Settings

The renderer automatically reads from localStorage if no per-column currency is specified:

```typescript
// User selects currency via CurrencyComponent
// All cells without explicit currencyCode will use the global setting
columnDefs = [
  {
    field: 'amount',
    cellRenderer: CurrencyCellRendererComponent
    // Uses global currency from CurrencyService
  }
];
```

---

## License

MIT
