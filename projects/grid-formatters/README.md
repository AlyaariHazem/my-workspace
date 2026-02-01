# ag-grid-formatters

![npm total downloads](https://img.shields.io/npm/dt/ag-grid-formatters)
![npm downloads (month)](https://img.shields.io/npm/dm/ag-grid-formatters)
![npm downloads (year)](https://img.shields.io/npm/dy/ag-grid-formatters)

A comprehensive Angular library providing **AG-Grid cell renderers** and **utilities** for formatting dates, times, currencies, and more. Features global format settings that persist across tabs and sessions, with real-time updates.

---

## Features

- 📅 **Date/Time/DateTime Cell Renderers** - Flexible date formatting for AG-Grid with timezone support
- 💰 **Currency Cell Renderer** - Multi-currency support with locale-aware formatting
- ⚙️ **Global Settings Component** - User-configurable date/time formats with live preview
- 🔄 **Cross-tab Synchronization** - Format changes sync across browser tabs automatically
- 💾 **Persistent Settings** - User preferences saved in localStorage
- 🎨 **Standalone Components** - All components are standalone, no module imports needed
- 🛠️ **Utility Functions** - Date formatting utilities and pipes for use outside AG-Grid

---

## Installation

```bash
npm install ag-grid-formatters
```

---

## Peer Dependencies

This library requires the following peer dependencies (you must install them in your application):

```bash
npm install @angular/common@^18.2.13 @angular/core@^18.2.13 @angular/material@^18.2.13
npm install ag-grid-angular@^31.3.4 ag-grid-community@^31.3.4
npm install moment@^2.30.1 moment-hijri@^2.30.0
npm install @syncfusion/ej2-angular-calendars@^31.1.22
npm install primeng@17.18.15 primeicons@^7.0.0 primeflex@^3.3.1
npm install rxjs@^7.8.0
```

---

## Quick Start

### 1. Date/Time Cell Renderers

Use the cell renderers in your AG-Grid column definitions:

```typescript
import { 
  DateCellRendererComponent,
  TimeCellRendererComponent,
  DateTimeCellRendererComponent 
} from 'ag-grid-formatters';

// In your component
columnDefs = [
  {
    field: 'createdAt',
    cellRenderer: DateCellRendererComponent,
    // Optional: override format per column
    cellRendererParams: {
      fmt: 'dd/MM/yyyy',           // Combined format
      // OR separate formats:
      dateFormat: 'dd/MM/yyyy',
      timeFormat: 'HH:mm',
      // Optional: timezone
      tz: 'Asia/Riyadh'
    }
  },
  {
    field: 'startTime',
    cellRenderer: TimeCellRendererComponent,
    cellRendererParams: {
      fmt: 'hh:mm a'  // 12-hour format
    }
  },
  {
    field: 'updatedAt',
    cellRenderer: DateTimeCellRendererComponent,
    cellRendererParams: {
      dateFormat: 'yyyy-MM-dd',
      timeFormat: 'HH:mm:ss',
      tz: 'UTC'
    }
  }
];
```

### 2. Currency Cell Renderer

```typescript
import { CurrencyCellRendererComponent } from 'ag-grid-formatters';

columnDefs = [
  {
    field: 'amount',
    cellRenderer: CurrencyCellRendererComponent,
    cellRendererParams: {
      // Optional: override currency code and locale per column
      currencyCode: 'USD',      // null = no currency symbol
      currencyLocale: 'en-US',  // Locale for number formatting
      minFractionDigits: 2,
      maxFractionDigits: 2,
      useGrouping: true
    }
  }
];
```

### 3. Settings Component

Add the settings component to allow users to configure global date/time formats:

```typescript
import { SettingsModule } from 'ag-grid-formatters';

// In your module
imports: [
  SettingsModule,
  // ... other imports
]
```

```html
<!-- In your template -->
<app-settings></app-settings>
```

The settings component:
- Provides a UI to select date and time formats
- Shows live preview of selected formats
- Persists preferences to localStorage
- Broadcasts changes to all AG-Grid renderers in the same tab
- Syncs across browser tabs via storage events

### 4. Utility Functions

Use the date formatting utilities outside of AG-Grid:

```typescript
import { formatDateValue } from 'ag-grid-formatters';

// Format a date value
const formatted = formatDateValue(new Date(), {
  kind: 'date',
  fmt: 'dd/MM/yyyy'
});

// With timezone
const formattedWithTz = formatDateValue('2024-01-15T10:30:00Z', {
  fmt: 'yyyy-MM-dd HH:mm',
  tz: 'Asia/Riyadh'
});
```

### 5. Date Format Pipe

Use the `fmtDate` pipe in templates:

```typescript
import { FmtDatePipe } from 'ag-grid-formatters';

// In your component
imports: [FmtDatePipe]
```

```html
<!-- In your template -->
<div>{{ myDate | fmtDate: { kind: 'date', fmt: 'dd/MM/yyyy' } }}</div>
<div>{{ myDateTime | fmtDate: { tz: 'Asia/Riyadh' } }}</div>
```

---

## Format Resolution Priority

The library uses the following priority order for format resolution:

1. **Column-level params** (highest priority)
   - `fmt` - Combined format string
   - `dateFormat` / `timeFormat` - Separate formats
   - `tz` - Timezone override

2. **LocalStorage** (user preferences from Settings component)
   - `selectedDateFormat`
   - `selectedDateTimeFormat`

3. **Defaults** (lowest priority)
   - Date: `'yyyy-MM-dd'`
   - Time: `'HH:mm'`

---

## Date Format Options

### Date Formats
- `'yyyy-MM-dd'` - ISO format (2024-01-15)
- `'dd/MM/yyyy'` - European format (15/01/2024)
- `'MM/dd/yyyy'` - US format (01/15/2024)
- `'dd-MM-yyyy'` - Dash format (15-01-2024)
- `'dd MMM yyyy'` - Text format (15 Jan 2024)
- `'MMM dd, yyyy'` - US text format (Jan 15, 2024)

### Time Formats
- `'HH:mm:ss'` - 24-hour with seconds (14:30:45)
- `'HH:mm'` - 24-hour (14:30)
- `'hh:mm:ss a'` - 12-hour with seconds (02:30:45 PM)
- `'hh:mm a'` - 12-hour (02:30 PM)

### Combined Formats
You can combine date and time formats:
- `'dd/MM/yyyy HH:mm'` - European with 24-hour time
- `'MM/dd/yyyy hh:mm a'` - US with 12-hour time

---

## Currency Formatting

### Supported Parameters

- `currencyCode` - ISO currency code (e.g., 'SAR', 'USD', 'EUR') or `null` for no symbol
- `currencyLocale` - BCP 47 locale string (e.g., 'ar-SA', 'en-US')
- `minFractionDigits` - Minimum decimal places (default: 0)
- `maxFractionDigits` - Maximum decimal places (default: 2)
- `useGrouping` - Enable thousand separators (default: true)

### Examples

```typescript
// Saudi Riyal with Arabic locale
{
  currencyCode: 'SAR',
  currencyLocale: 'ar-SA',
  minFractionDigits: 2,
  maxFractionDigits: 2
}

// US Dollar with English locale
{
  currencyCode: 'USD',
  currencyLocale: 'en-US',
  minFractionDigits: 2,
  maxFractionDigits: 2
}

// Number without currency symbol
{
  currencyCode: null,
  currencyLocale: 'en-US',
  minFractionDigits: 0,
  maxFractionDigits: 2
}
```

---

## Timezone Support

All date/time renderers support timezone conversion using IANA timezone identifiers:

```typescript
cellRendererParams: {
  tz: 'Asia/Riyadh',  // Saudi Arabia
  // or
  tz: 'UTC',
  // or
  tz: 'America/New_York',
  // or null/undefined/'local' for browser local time
}
```

---

## API Reference

### Cell Renderers

#### `DateCellRendererComponent`
Renders date-only values.

**Params:**
- `fmt?: string` - Combined format string
- `dateFormat?: string` - Date format override
- `tz?: string | null` - Timezone override

#### `TimeCellRendererComponent`
Renders time-only values.

**Params:**
- `fmt?: string` - Combined format string
- `timeFormat?: string` - Time format override
- `tz?: string | null` - Timezone override

#### `DateTimeCellRendererComponent`
Renders date and time values.

**Params:**
- `fmt?: string` - Combined format string
- `dateFormat?: string` - Date format override
- `timeFormat?: string` - Time format override
- `tz?: string | null` - Timezone override

#### `CurrencyCellRendererComponent`
Renders currency values.

**Params:**
- `currencyCode?: string | null` - ISO currency code
- `currencyLocale?: string` - BCP 47 locale
- `minFractionDigits?: number` - Min decimal places
- `maxFractionDigits?: number` - Max decimal places
- `useGrouping?: boolean` - Enable grouping

### Utility Functions

#### `formatDateValue(value: any, opts?: FormatDateOptions): string`
Formats a date value using the same logic as the cell renderers.

**Parameters:**
- `value` - Date value (Date, string, number, etc.)
- `opts` - Formatting options (same as cell renderer params)

**Returns:** Formatted date string

### Pipes

#### `FmtDatePipe`
Standalone pipe for formatting dates in templates.

**Usage:**
```html
{{ dateValue | fmtDate: { kind: 'date', fmt: 'dd/MM/yyyy' } }}
```

### Services

#### `SettingsService`
Service for managing date/time format preferences.

**Methods:**
- `getDateFormat(): string` - Get current date format
- `setDateFormat(format: string): void` - Set date format
- `getDateTimeFormat(): string` - Get current time format
- `setDateTimeFormat(format: string): void` - Set time format

---

## Type Definitions

```typescript
interface BaseFormatParams {
  fmt?: string;              // Combined format override
  dateFormat?: string;       // Date format override
  dateFmt?: string;          // Alias for dateFormat
  timeFormat?: string;       // Time format override
  timeFmt?: string;          // Alias for timeFormat
  timezone?: string | null;  // Timezone override
  tz?: string;               // Alias for timezone
}

type FormatKind = 'date' | 'time' | 'datetime';
```

---

## Events

The library dispatches custom events for format changes:

- `dt-format-changed` - Dispatched when date/time formats change (same tab)
- `currency-format-changed` - Dispatched when currency format changes (same tab)

Storage events are automatically handled for cross-tab synchronization.

---

## Examples

### Complete AG-Grid Setup

```typescript
import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import {
  DateCellRendererComponent,
  DateTimeCellRendererComponent,
  CurrencyCellRendererComponent
} from 'ag-grid-formatters';

@Component({
  selector: 'app-grid',
  template: `
    <ag-grid-angular
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      class="ag-theme-alpine">
    </ag-grid-angular>
  `
})
export class GridComponent {
  rowData = [
    { id: 1, name: 'Item 1', price: 100.50, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Item 2', price: 250.75, createdAt: new Date(), updatedAt: new Date() }
  ];

  columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'name' },
    {
      field: 'price',
      cellRenderer: CurrencyCellRendererComponent,
      cellRendererParams: {
        currencyCode: 'SAR',
        currencyLocale: 'ar-SA'
      }
    },
    {
      field: 'createdAt',
      cellRenderer: DateCellRendererComponent
    },
    {
      field: 'updatedAt',
      cellRenderer: DateTimeCellRendererComponent,
      cellRendererParams: {
        tz: 'Asia/Riyadh'
      }
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true
  };
}
```

---

## Browser Support

This library requires modern browsers with support for:
- ES2022 features
- localStorage API
- Custom Events API
- Intl API (for currency formatting)

---

## License

MIT

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/AlyaariHazem/my-workspace).
