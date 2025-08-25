 import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  // Dates only
  dateFormats = [
    'yyyy-MM-dd','dd/MM/yyyy','MM/dd/yyyy','yyyy/MM/dd',
    'dd-MM-yyyy','MM-dd-yyyy','dd MMM yyyy','MMM dd, yyyy'
  ];

  // ⬇️ Time only
  dateTimeFormats = [          // keep name to avoid app changes
    'HH:mm:ss',
    'HH:mm',
    'hh:mm:ss a',
    'hh:mm a'
  ];

  private selectedDateFormat =
    localStorage.getItem('selectedDateFormat') || 'yyyy-MM-dd';
  private selectedDateTimeFormat =
    localStorage.getItem('selectedDateTimeFormat') || 'HH:mm';

  setDateFormat(f: string) { if (this.dateFormats.includes(f)) {
    this.selectedDateFormat = f; localStorage.setItem('selectedDateFormat', f); } }
  getDateFormat() { return this.selectedDateFormat; }

  setDateTimeFormat(f: string) { if (this.dateTimeFormats.includes(f)) {
    this.selectedDateTimeFormat = f; localStorage.setItem('selectedDateTimeFormat', f); } }
  getDateTimeFormat() { return this.selectedDateTimeFormat; }
}
