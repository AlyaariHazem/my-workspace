// date-format.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateFormatService {
  /** Angular pattern chosen by the user (fallback dd/MM/yyyy) */
  get angular(): string {
    return localStorage.getItem('selectedDateFormat') || 'dd/MM/yyyy';
  }

  /** Convert Angular tokens to moment-hijri tokens */
  get momentHijri(): string {
    let f = this.angular;

    // order matters: longest tokens first
    return f
    .replace(/yyyy/g, 'iYYYY')
    .replace(/yy/g, 'iYY')
    .replace(/MMMM/g, 'iMMMM')
    .replace(/MMM/g, 'MM')
    .replace(/MM/g, 'M')
    .replace(/M/g, 'iM')
    .replace(/dd/g, 'iDD')
    .replace(/d/g, 'iD');
  }
}
