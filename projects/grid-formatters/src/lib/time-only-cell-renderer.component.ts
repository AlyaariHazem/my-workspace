// // time-cell-renderer.component.ts
// import {
//   Component,
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
// } from '@angular/core';
// import { formatDate } from '@angular/common';
// import { SettingsService } from './settings/settings.service';
// import { BaseFormatRenderer } from './ag-base-format-renderer';
// import { FormatKind } from './ag-format.types';

// @Component({
//   selector: 'app-time-cell',
//   template: `{{ display }}`,
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class TimeCellRendererComponent extends BaseFormatRenderer {
//   protected kind: FormatKind = 'time';
//   constructor(settings: SettingsService, cdr: ChangeDetectorRef) {
//     super(settings, cdr);
//   }

//   // Override to keep support for values like "13:45" or "1:45 pm"
//   protected override render(value: any): void {
//     if (value == null || value === '') {
//       this.display = '';
//       this.cdr.markForCheck();
//       return;
//     }

//     // Parse to Date
//     let d: Date | null = null;

//     if (value instanceof Date) {
//       d = value;
//     } else if (typeof value === 'number') {
//       d = new Date(value < 1e12 ? value * 1000 : value);
//     } else {
//       const s = String(value).trim();

//       // Match "HH:mm" or "HH:mm:ss" with optional am/pm
//       const m = s.match(
//         /^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\s*$/
//       );
//       if (m) {
//         const today = new Date();
//         let hh = parseInt(m[1], 10);
//         const mm = parseInt(m[2], 10);
//         const ss = m[3] ? parseInt(m[3], 10) : 0;
//         const ampm = (m[4] || '').toLowerCase();

//         if (ampm) {
//           if (ampm === 'pm' && hh < 12) hh += 12;
//           if (ampm === 'am' && hh === 12) hh = 0;
//         }

//         d = new Date(
//           today.getFullYear(),
//           today.getMonth(),
//           today.getDate(),
//           hh,
//           mm,
//           ss,
//           0
//         );
//       } else {
//         const t = new Date(s);
//         d = isNaN(t.getTime()) ? null : t;
//       }
//     }

//     if (!d) {
//       this.display = '';
//       this.cdr.markForCheck();
//       return;
//     }

//     // Base keeps this.fmt = current time format (or column override)
//     const fmt = this.fmt || this.timeFmt || 'HH:mm';

//     this.display = this.tz
//       ? formatDate(d, fmt, 'en-US', this.tz) ?? ''
//       : formatDate(d, fmt, 'en-US') ?? '';

//     this.cdr.markForCheck();
//   }
// }

import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { BaseFormatRenderer } from "./ag-base-format-renderer";
import { FormatKind } from "./ag-format.types";
import { SettingsService } from "../public-api";
// time-only
@Component({
  selector: 'app-time-cell',
  standalone: true,
  template: `{{ display }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeCellRendererComponent extends BaseFormatRenderer {
  protected kind: FormatKind = 'time';
  constructor(settings: SettingsService, cdr: ChangeDetectorRef) {
    super(settings, cdr);
  }
}
