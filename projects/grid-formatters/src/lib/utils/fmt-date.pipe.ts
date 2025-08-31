import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { formatDate } from '@angular/common';

type FormatKind = 'date' | 'time' | 'datetime';

export interface FmtDateOptions {
  /** force kind; default: infer (time-like -> 'time', date-only -> 'date', else 'datetime') */
  kind?: FormatKind;
  /** combined override (e.g. 'dd/MM/yyyy HH:mm'); wins over everything */
  fmt?: string;
  /** separate overrides (used if 'fmt' is not provided) */
  dateFormat?: string;
  timeFormat?: string;
  /** IANA tz (e.g., 'UTC', 'Asia/Riyadh'); omit/'local' => browser local */
  tz?: string | null;
}

const LS_DATE_FMT_KEY   = 'selectedDateFormat';
const LS_TIME_FMT_KEY   = 'selectedDateTimeFormat';
const DEFAULT_DATE_FMT  = 'yyyy-MM-dd';
const DEFAULT_TIME_FMT  = 'HH:mm';
const DT_EVT            = 'dt-format-changed';

@Pipe({
  name: 'fmtDate',
  standalone: true,
  // impure so it re-evaluates when CD runs; we also nudge CD on format-change events
  pure: false,
})
export class FmtDatePipe implements PipeTransform, OnDestroy {
  private bump = 0; // internal "version" to make Angular see a change

  constructor(private cdr: ChangeDetectorRef) {
    // Cross-tab changes (native storage event)
    window.addEventListener('storage', this.onStorage);
    // Same-tab changes (your Apply button dispatches 'dt-format-changed')
    window.addEventListener(DT_EVT, this.onDtChanged);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorage);
    window.removeEventListener(DT_EVT, this.onDtChanged);
  }

  transform(value: any, opts: FmtDateOptions = {}): string {
    // touch the bump so Angular considers this pipe "dirty" when we increment it
    void this.bump;

    if (value == null || value === '') return '';

    const date = this.toDate(value);
    if (!date) return String(value);

    const { fmt, tz } = this.resolveFmt(opts, value);

    try {
      return tz
        ? formatDate(date, fmt, 'en-US', tz) ?? ''
        : formatDate(date, fmt, 'en-US') ?? '';
    } catch {
      return String(value);
    }
  }

  // --------------------------- formats ---------------------------
  private resolveFmt(opts: FmtDateOptions, original: any): { fmt: string; tz: string | null } {
    const tzRaw = (opts?.tz ?? null) as string | null;
    const tz = !tzRaw || tzRaw === 'local' ? null : tzRaw;

    // 1) combined override wins
    if (opts.fmt) {
      // If user passed only date or only time tokens, respect 'kind' if provided
      if (opts.kind === 'date' && !/[Hh]/.test(opts.fmt)) return { fmt: opts.fmt, tz };
      if (opts.kind === 'time' && /[Hh]/.test(opts.fmt) && !/[yMd]/i.test(opts.fmt)) return { fmt: opts.fmt, tz };

      const [dGuess, tGuess] = this.splitCombinedFmt(opts.fmt);
      const df = opts.dateFormat ?? dGuess ?? this.getDateFmtFromLS();
      const tf = opts.timeFormat ?? tGuess ?? this.getTimeFmtFromLS();
      return { fmt: `${df} ${tf}`.trim(), tz };
    }

    // 2) pick kind (explicit or inferred)
    const kind = opts.kind ?? this.inferKind(original);
    if (kind === 'date') {
      const df = opts.dateFormat ?? this.getDateFmtFromLS();
      return { fmt: df, tz };
    }
    if (kind === 'time') {
      const tf = opts.timeFormat ?? this.getTimeFmtFromLS();
      return { fmt: tf, tz };
    }

    // 3) datetime
    const df = opts.dateFormat ?? this.getDateFmtFromLS();
    const tf = opts.timeFormat ?? this.getTimeFmtFromLS();
    return { fmt: `${df} ${tf}`.trim(), tz };
  }

  private getDateFmtFromLS(): string {
    try {
      return typeof window !== 'undefined'
        ? window.localStorage?.getItem(LS_DATE_FMT_KEY) || DEFAULT_DATE_FMT
        : DEFAULT_DATE_FMT;
    } catch { return DEFAULT_DATE_FMT; }
  }

  private getTimeFmtFromLS(): string {
    try {
      return typeof window !== 'undefined'
        ? window.localStorage?.getItem(LS_TIME_FMT_KEY) || DEFAULT_TIME_FMT
        : DEFAULT_TIME_FMT;
    } catch { return DEFAULT_TIME_FMT; }
  }

  // ---------------------------- parsing ----------------------------
  private inferKind(v: any): FormatKind {
    const s = String(v ?? '').trim();
    if (!s) return 'datetime';
    if (/^\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM|am|pm)?$/.test(s)) return 'time';
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(s) || /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s)) return 'date';
    return 'datetime';
  }

  private toDate(value: any): Date | null {
    if (value instanceof Date) return value;

    if (typeof value === 'number') {
      // accept seconds or ms
      return new Date(value < 1e12 ? value * 1000 : value);
    }

    const s = String(value).trim();
    if (!s) return null;

    // ISO & ISO-like
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

    // yyyy-MM-dd (no time)
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return this.safeLocalDate(+m[1], +m[2], +m[3]);

    // time-only (HH:mm[:ss] [AM/PM]?)
    m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/);
    if (m) {
      let hh = +m[1], mm = +m[2], ss = +(m[3] || 0);
      const ap = (m[4] || '').toLowerCase();
      if (ap === 'pm' && hh < 12) hh += 12;
      if (ap === 'am' && hh === 12) hh = 0;
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, ss, 0);
    }

    const t = new Date(s);
    return isNaN(t.getTime()) ? null : t;
  }

  private safeLocalDate(y: number, m: number, d: number): Date | null {
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    return (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) ? dt : null;
  }

  /** crude splitter: left of first [Hh] = date, rest = time */
  private splitCombinedFmt(fmt: string): [string, string] {
    const idx = fmt.search(/[Hh]/);
    if (idx <= 0) return [fmt.trim(), DEFAULT_TIME_FMT];
    const d = fmt.slice(0, idx).trim();
    const t = fmt.slice(idx).trim();
    return [d || DEFAULT_DATE_FMT, t || DEFAULT_TIME_FMT];
  }

  // ------------------------- event handlers -------------------------
  private onStorage = (ev: StorageEvent) => {
    if (!ev.key || (ev.key !== LS_DATE_FMT_KEY && ev.key !== LS_TIME_FMT_KEY)) return;
    this.bump++; try { this.cdr.markForCheck(); } catch {}
  };

  private onDtChanged = () => {
    this.bump++; try { this.cdr.markForCheck(); } catch {}
  };
}
//how to use it?
// {{ row?.createdAt | fmtDate }}                       <!-- datetime -->
// {{ row?.startDate | fmtDate:{ kind:'date' } }}      <!-- date only -->
// {{ row?.startTime | fmtDate:{ kind:'time' } }}      <!-- time only -->

// <!-- explicit overrides (still fallback to LS for the other part) -->
// {{ row?.createdAt | fmtDate:{ fmt:'dd/MM/yyyy HH:mm' } }}
// {{ row?.createdAt | fmtDate:{ dateFormat:'dd/MM/yyyy' } }}
// {{ row?.createdAt | fmtDate:{ timeFormat:'hh:mm a' } }}

// <!-- timezone -->
// {{ row?.createdAt | fmtDate:{ kind:'datetime', tz:'Asia/Riyadh' } }}
