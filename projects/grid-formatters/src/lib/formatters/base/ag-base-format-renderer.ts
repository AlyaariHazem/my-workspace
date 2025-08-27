// ag-base-format-renderer.ts
// Precedence: params.* overrides > localStorage > defaults.
// Listens to: window:storage (other tabs) + window:dt-format-changed (same tab)

import { ChangeDetectorRef, Directive, HostListener } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { formatDate } from '@angular/common';
import { BaseFormatParams, FormatKind } from '../../ag-format.types';

const LS_DATE_FMT_KEY   = 'selectedDateFormat';
const LS_TIME_FMT_KEY   = 'selectedDateTimeFormat';
const DEFAULT_DATE_FMT  = 'yyyy-MM-dd';
const DEFAULT_TIME_FMT  = 'HH:mm';
const DT_EVT            = 'dt-format-changed';

@Directive()
export abstract class BaseFormatRenderer<TData = any>
  implements ICellRendererAngularComp {
  display = '';
  protected params!: BaseFormatParams<TData>;
  protected fmt = '';
  protected dateFmt: string | undefined;
  protected timeFmt: string | undefined;
  protected tz: string | null = null;

  protected abstract kind: FormatKind;

  constructor(protected cdr: ChangeDetectorRef) {}

  agInit(params: BaseFormatParams<TData>): void {
    this.params = params;
    this.resolveFmtAndTz();
    this.render(params.value);
  }

  refresh(params: BaseFormatParams<TData>): boolean {
    this.params = params;
    this.resolveFmtAndTz();
    this.render(params.value);
    return true;
  }

  // Cross-tab (native storage event)
  @HostListener('window:storage', ['$event'])
  onStorageChanged(ev: StorageEvent) {
    if (!ev.key || (ev.key !== LS_DATE_FMT_KEY && ev.key !== LS_TIME_FMT_KEY)) return;
    this.resolveFmtAndTz();
    this.render(this.params?.value);
  }

  // Same tab (dispatch from Apply)
  @HostListener(`window:${DT_EVT}`, ['$event'])
  onDtFormatChanged(_ev: CustomEvent<{ dateFormat?: string; timeFormat?: string }>) {
    this.resolveFmtAndTz();
    this.render(this.params?.value);
  }

  // ----------------------------- resolution ---------------------------------
  private resolveFmtAndTz(): void {
    const p = this.params;

    // timezone: params only; null => browser local
    const tzRaw = (p.timezone ?? p.tz ?? null) as string | null;
    this.tz = !tzRaw || tzRaw === 'local' ? null : tzRaw;

    // single combined override wins
    if (p.fmt) {
      this.fmt = p.fmt;
      const [dGuess, tGuess] = this.splitCombinedFmt(p.fmt);
      this.dateFmt = this.dateFmt ?? dGuess;
      this.timeFmt = this.timeFmt ?? tGuess;
      return;
    }

    if (this.kind === 'date') {
      const df = p.dateFormat ?? p.dateFmt ?? this.getDateFmtFromLS();
      this.dateFmt = df;
      this.fmt = df;
      return;
    }

    if (this.kind === 'time') {
      const tf = p.timeFormat ?? p.timeFmt ?? this.getTimeFmtFromLS();
      this.timeFmt = tf;
      this.fmt = tf;
      return;
    }

    // datetime
    const df = p.dateFormat ?? p.dateFmt ?? this.getDateFmtFromLS();
    const tf = p.timeFormat ?? p.timeFmt ?? this.getTimeFmtFromLS();
    this.dateFmt = df;
    this.timeFmt = tf;
    this.fmt = `${df} ${tf}`.trim();
  }

  // ------------------------------- render -----------------------------------
  protected render(value: any): void {
    if (value == null || value === '') {
      this.display = '';
      return void this.invalidateView();
    }

    const d = this.toDate(value);
    if (d) {
      this.display = this.tz
        ? formatDate(d, this.fmt, 'en-US', this.tz) ?? ''
        : formatDate(d, this.fmt, 'en-US') ?? '';
    } else {
      // Couldn’t parse → show original safely
      this.display = String(value);
    }
    this.invalidateView();
  }

  private invalidateView() {
    try {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    } catch {}
  }

  // ------------------------------ helpers -----------------------------------
  private toDate(value: any): Date | null {
    if (value instanceof Date) return value;

    if (typeof value === 'number') {
      return new Date(value < 1e12 ? value * 1000 : value); // seconds vs ms
    }

    const s = String(value).trim();
    if (!s) return null;

    // ISO & ISO-like (fast path)
    if (/^\d{4}-\d{2}-\d{2}(?:[T ][\s\S]*)?$/.test(s)) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }

    // yyyy/MM/dd
    let m = s.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (m) return this.safeLocalDate(+m[1], +m[2], +m[3]);

    // dd/MM/yyyy
    m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return this.safeLocalDate(+m[3], +m[2], +m[1]);

    // dd-MM-yyyy
    m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) return this.safeLocalDate(+m[3], +m[2], +m[1]);

    // yyyy-MM-dd (without time but not caught by ISO path)
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return this.safeLocalDate(+m[1], +m[2], +m[3]);

    // Time-only (HH:mm[:ss] [AM/PM]?) → anchor on today so formatDate can render
    m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/);
    if (m) {
      let hh = +m[1], mm = +m[2], ss = +(m[3] || 0);
      const ap = (m[4] || '').toLowerCase();
      if (ap === 'pm' && hh < 12) hh += 12;
      if (ap === 'am' && hh === 12) hh = 0;
      const today = new Date();
      return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hh, mm, ss, 0
      );
    }

    // Last resort: native parser
    const t = new Date(s);
    return isNaN(t.getTime()) ? null : t;
  }

  private safeLocalDate(y: number, m: number, d: number): Date | null {
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    // Guard invalid (e.g., 31/11/2025)
    return (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d)
      ? dt
      : null;
  }

  /** crude splitter: left of first [Hh] = date, rest = time */
  private splitCombinedFmt(fmt: string): [string, string] {
    const idx = fmt.search(/[Hh]/);
    if (idx <= 0) return [fmt.trim(), DEFAULT_TIME_FMT];
    const d = fmt.slice(0, idx).trim();
    const t = fmt.slice(idx).trim();
    return [d || DEFAULT_DATE_FMT, t || DEFAULT_TIME_FMT];
  }

  private getDateFmtFromLS(): string {
    try {
      return typeof window !== 'undefined'
        ? window.localStorage?.getItem(LS_DATE_FMT_KEY) || DEFAULT_DATE_FMT
        : DEFAULT_DATE_FMT;
    } catch {
      return DEFAULT_DATE_FMT;
    }
  }

  private getTimeFmtFromLS(): string {
    try {
      return typeof window !== 'undefined'
        ? window.localStorage?.getItem(LS_TIME_FMT_KEY) || DEFAULT_TIME_FMT
        : DEFAULT_TIME_FMT;
    } catch {
      return DEFAULT_TIME_FMT;
    }
  }
}
