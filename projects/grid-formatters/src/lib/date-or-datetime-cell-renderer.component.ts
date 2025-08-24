// import {
//   Component,
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
// } from '@angular/core';
// import { SettingsService } from './settings/settings.service';
// import { BaseFormatRenderer } from './ag-base-format-renderer';
// import { FormatKind } from './ag-format.types';
// import { formatDate } from '@angular/common';

// @Component({
//   selector: 'app-smart-date-or-datetime-cell',
//   template: `{{ display }}`,
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class DateOrDateTimeCellRendererComponent extends BaseFormatRenderer {
//   protected kind: FormatKind = 'datetime';
//   constructor(settings: SettingsService, cdr: ChangeDetectorRef) {
//     super(settings, cdr);
//   }

//   protected override render(value: any): void {
//     if (value == null || value === '') {
//       this.display = '';
//       this.cdr.markForCheck();
//       return;
//     }
//     const d =
//       value instanceof Date
//         ? value
//         : typeof value === 'number'
//         ? new Date(value < 1e12 ? value * 1000 : value)
//         : new Date(String(value).trim());

//     if (isNaN(d.getTime())) {
//       const s = String(value);
//       this.display = s.includes('T') ? s.slice(0, 10) : s.split(' ')[0];
//       this.cdr.markForCheck();
//       return;
//     }

//     // Ensure we have formats (fallbacks if someone only set fmt)
//     const dateFmt = this.dateFmt || 'yyyy-MM-dd';
//     const timeFmt = this.timeFmt || 'HH:mm';

//     // Midnight detection in effective timezone
//     const timeSig = this.tz
//       ? formatDate(d, 'HH:mm:ss.SSS', 'en-US', this.tz)
//       : formatDate(d, 'HH:mm:ss.SSS', 'en-US');
//     const isMidnight = timeSig === '00:00:00.000';

//     if (isMidnight) {
//       this.display = this.tz
//         ? formatDate(d, dateFmt, 'en-US', this.tz) ?? ''
//         : formatDate(d, dateFmt, 'en-US') ?? '';
//     } else {
//       const datePart = this.tz
//         ? formatDate(d, dateFmt, 'en-US', this.tz) ?? ''
//         : formatDate(d, dateFmt, 'en-US') ?? '';
//       const timePart = this.tz
//         ? formatDate(d, timeFmt, 'en-US', this.tz) ?? ''
//         : formatDate(d, timeFmt, 'en-US') ?? '';
//       this.display = `${datePart} ${timePart}`.trim();
//     }

//     this.cdr.markForCheck();
//   }
// }
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { BaseFormatRenderer } from "./ag-base-format-renderer";
import { FormatKind } from "./ag-format.types";
import { SettingsService } from "../public-api";
// date+time
@Component({
  selector: 'app-datetime-cell',
  standalone: true,
  template: `{{ display }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeCellRendererComponent extends BaseFormatRenderer {
  protected kind: FormatKind = 'datetime';
  constructor(settings: SettingsService, cdr: ChangeDetectorRef) {
    super(settings, cdr);
  }
}
