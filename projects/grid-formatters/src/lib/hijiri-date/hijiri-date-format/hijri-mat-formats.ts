// hijri-mat-formats.ts
import { MatDateFormats } from '@angular/material/core';
import { DateFormatService } from './date-format.service';

export function hijriMatFormatsFactory(fmt: DateFormatService): MatDateFormats {
  const pattern = fmt.momentHijri; // e.g. "iDD/iMM/iYYYY"
  return {
    parse:   { dateInput: pattern },
    display: {
      dateInput: pattern,
      monthYearLabel: 'iMMMM iYYYY',
      dateA11yLabel: pattern,
      monthYearA11yLabel: 'iMMMM iYYYY',
    },
  };
}
