import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  // ── Keys ─────────────────────────────────────────────────────────────────────
  private readonly DATE_KEY = 'selectedDateFormat';
  private readonly TIME_KEY = 'selectedDateTimeFormat';
  private readonly LEGACY_TIME_KEY = 'selectedTimeFormat'; // fallback if used elsewhere
  private readonly TZ_KEY   = 'selectedTimezone';          // optional (default 'local')
   private bc = typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('grid-formatters:fmt')
    : null;
    constructor() {
    this.bc?.addEventListener('message', (ev: MessageEvent) => {
      const { type, value } = ev.data || {};
      if (type === 'date')      this._dateFormat$.next(value);
      else if (type === 'time') this._timeFormat$.next(value);
      else if (type === 'tz')   this._timezone$.next(value);
    });
  }

  // ── Presets (unchanged names to avoid app changes) ───────────────────────────
  // Dates only
  readonly dateFormats: string[] = [
    'yyyy-MM-dd','dd/MM/yyyy','MM/dd/yyyy','yyyy/MM/dd',
    'dd-MM-yyyy','MM-dd-yyyy','dd MMM yyyy','MMM dd, yyyy'
  ];

  // Time only (keep property name as requested)
  readonly dateTimeFormats: string[] = [
    'HH:mm:ss','HH:mm','hh:mm:ss a','hh:mm a'
  ];

  // Optional timezone presets (use if you add a dropdown later)
  readonly timezones: string[] = ['local', 'UTC', 'Asia/Aden', '+0300'];

  // ── Reactive state ───────────────────────────────────────────────────────────
  private _dateFormat$ = new BehaviorSubject<string>(
    localStorage.getItem(this.DATE_KEY) || 'yyyy-MM-dd'
  );

  private _timeFormat$ = new BehaviorSubject<string>(
    localStorage.getItem(this.TIME_KEY) ||
    localStorage.getItem(this.LEGACY_TIME_KEY) ||
    'HH:mm'
  );

  private _timezone$ = new BehaviorSubject<string>(
    localStorage.getItem(this.TZ_KEY) || 'local'
  );

  // Public streams
  readonly dateFormat$ = this._dateFormat$.asObservable();
  readonly timeFormat$ = this._timeFormat$.asObservable();
  readonly timezone$   = this._timezone$.asObservable();

  // Handy combined stream if a component needs all at once
  readonly formats$ = combineLatest([this.dateFormat$, this.timeFormat$, this.timezone$]);

  // ── Getters (sync) ──────────────────────────────────────────────────────────
  getDateFormat(): string     { return this._dateFormat$.value; }
  getDateTimeFormat(): string { return this._timeFormat$.value; }
  getTimezone(): string       { return this._timezone$.value; }   // optional

  // ── Setters (persist + emit) ────────────────────────────────────────────────
  setDateFormat(f: string): void {
    if (!this.dateFormats.includes(f)) return; // guard
    localStorage.setItem(this.DATE_KEY, f);
    this._dateFormat$.next(f);                 // 🔊 emit change
    this.bc?.postMessage({ type: 'date', value: f });
  }

  setDateTimeFormat(f: string): void {
    if (!this.dateTimeFormats.includes(f)) return; // guard
    localStorage.setItem(this.TIME_KEY, f);
    this._timeFormat$.next(f);                      // 🔊 emit change
     this.bc?.postMessage({ type: 'time', value: f });   // 👈 broadcast
  }

  // Optional: timezone support (safe to ignore if you don’t use it yet)
  setTimezone(tz: string): void {
    // accept anything, or restrict to this.timezones.includes(tz)
    localStorage.setItem(this.TZ_KEY, tz);
    this._timezone$.next(tz);                       // 🔊 emit change
    this.bc?.postMessage({ type: 'tz', value: tz });    // 👈 broadcast
  }

  /** Optional: force re-emit current values (usually not needed) */
  emitCurrent(): void {
    this._dateFormat$.next(this._dateFormat$.value);
    this._timeFormat$.next(this._timeFormat$.value);
    this._timezone$.next(this._timezone$.value);
  }
}
