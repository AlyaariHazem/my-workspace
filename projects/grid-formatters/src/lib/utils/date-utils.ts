import { formatDate } from '@angular/common';
import { FormatKind } from '../ag-format.types';

export interface FormatDateOptions {
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

/**
 * Standalone utility function to format dates with the same logic as fmtDate pipe and ag-base-format-renderer.
 * 
 * @param value - Date value (Date, string, number, etc.)
 * @param opts - Formatting options
 * @returns Formatted date string, or original value as string if parsing fails
 * 
 * @example
 * formatDateValue(new Date()) // Uses localStorage/default format
 * formatDateValue('2024-01-15', { kind: 'date' })
 * formatDateValue(row.createdAt, { fmt: 'dd/MM/yyyy HH:mm', tz: 'Asia/Riyadh' })
 * formatDateValue(new Date())
   formatDateValue('2024-01-15')

  // With options
  formatDateValue(row.createdAt, { kind: 'date' })
  formatDateValue(row.startTime, { kind: 'time' })
  formatDateValue(row.createdAt, { fmt: 'dd/MM/yyyy HH:mm' })
  formatDateValue(row.createdAt, { tz: 'Asia/Riyadh' })
  formatDateValue(row.createdAt, { dateFormat: 'dd/MM/yyyy', timeFormat: 'hh:mm a' })
 */
export function formatDateValue(value: any, opts: FormatDateOptions = {}): string {
  if (value == null || value === '') return '';

  const date = parseToDate(value);
  if (!date) return String(value);

  const { fmt, tz } = resolveFormat(opts, value);

  try {
    return tz
      ? formatDate(date, fmt, 'en-US', tz) ?? ''
      : formatDate(date, fmt, 'en-US') ?? '';
  } catch {
    return String(value);
  }
}

// --------------------------- format resolution ---------------------------
function resolveFormat(opts: FormatDateOptions, original: any): { fmt: string; tz: string | null } {
  const tzRaw = (opts?.tz ?? null) as string | null;
  const tz = !tzRaw || tzRaw === 'local' ? null : tzRaw;

  // 1) combined override wins
  if (opts.fmt) {
    // If user passed only date or only time tokens, respect 'kind' if provided
    if (opts.kind === 'date' && !/[Hh]/.test(opts.fmt)) return { fmt: opts.fmt, tz };
    if (opts.kind === 'time' && /[Hh]/.test(opts.fmt) && !/[yMd]/i.test(opts.fmt)) return { fmt: opts.fmt, tz };

    const [dGuess, tGuess] = splitCombinedFmt(opts.fmt);
    const df = opts.dateFormat ?? dGuess ?? getDateFmtFromLS();
    const tf = opts.timeFormat ?? tGuess ?? getTimeFmtFromLS();
    return { fmt: `${df} ${tf}`.trim(), tz };
  }

  // 2) pick kind (explicit or inferred)
  const kind = opts.kind ?? inferKind(original);
  if (kind === 'date') {
    const df = opts.dateFormat ?? getDateFmtFromLS();
    return { fmt: df, tz };
  }
  if (kind === 'time') {
    const tf = opts.timeFormat ?? getTimeFmtFromLS();
    return { fmt: tf, tz };
  }

  // 3) datetime
  const df = opts.dateFormat ?? getDateFmtFromLS();
  const tf = opts.timeFormat ?? getTimeFmtFromLS();
  return { fmt: `${df} ${tf}`.trim(), tz };
}

function getDateFmtFromLS(): string {
  try {
    return typeof window !== 'undefined'
      ? window.localStorage?.getItem(LS_DATE_FMT_KEY) || DEFAULT_DATE_FMT
      : DEFAULT_DATE_FMT;
  } catch { return DEFAULT_DATE_FMT; }
}

function getTimeFmtFromLS(): string {
  try {
    return typeof window !== 'undefined'
      ? window.localStorage?.getItem(LS_TIME_FMT_KEY) || DEFAULT_TIME_FMT
      : DEFAULT_TIME_FMT;
  } catch { return DEFAULT_TIME_FMT; }
}

// ---------------------------- parsing ----------------------------
function inferKind(v: any): FormatKind {
  const s = String(v ?? '').trim();
  if (!s) return 'datetime';
  if (/^\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM|am|pm)?$/.test(s)) return 'time';
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(s) || /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s)) return 'date';
  return 'datetime';
}

function parseToDate(value: any): Date | null {
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
  if (m) return safeLocalDate(+m[1], +m[2], +m[3]);

  // dd/MM/yyyy
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return safeLocalDate(+m[3], +m[2], +m[1]);

  // dd-MM-yyyy
  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return safeLocalDate(+m[3], +m[2], +m[1]);

  // yyyy-MM-dd (no time)
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return safeLocalDate(+m[1], +m[2], +m[3]);

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

function safeLocalDate(y: number, m: number, d: number): Date | null {
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) ? dt : null;
}

/** crude splitter: left of first [Hh] = date, rest = time */
function splitCombinedFmt(fmt: string): [string, string] {
  const idx = fmt.search(/[Hh]/);
  if (idx <= 0) return [fmt.trim(), DEFAULT_TIME_FMT];
  const d = fmt.slice(0, idx).trim();
  const t = fmt.slice(idx).trim();
  return [d || DEFAULT_DATE_FMT, t || DEFAULT_TIME_FMT];
}

// Convert any date/time to UTC ISO (no milliseconds).
// If time is 00:00:00.000 (midnight), fill it from the current system clock.
export function formatDateToUTC(input?: Date | string | number): string {
  const now = new Date();
  let d: Date;

  if (input == null || input === '') {
    d = new Date(now.getTime());
  } else if (input instanceof Date) {
    d = new Date(input.getTime());
  } else if (typeof input === 'number') {
    d = new Date(input);
  } else if (typeof input === 'string') {
    const s = input.trim();

    // YYYY-MM-DD (date-only) → attach current local time
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, day] = s.split('-').map(Number);
      d = new Date(
        y, (m ?? 1) - 1, day ?? 1,
        now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()
      );
    }
    // HH:mm or HH:mm:ss (time-only) → use today's date with that time
    else if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
      const [hh, mm, ss = '0'] = s.split(':');
      d = new Date(
        now.getFullYear(), now.getMonth(), now.getDate(),
        Number(hh), Number(mm), Number(ss), 0
      );
    }
    // Otherwise (ISO/with TZ/etc.) → let JS parse it
    else {
      d = new Date(s);
    }
  } else {
    d = new Date(input as any);
  }

  if (isNaN(d.getTime())) return 'Invalid Date';

  // If time is exactly midnight (local), inject current system time
  if (
    d.getHours() === 0 &&
    d.getMinutes() === 0 &&
    d.getSeconds() === 0 &&
    d.getMilliseconds() === 0
  ) {
    d = new Date(
      d.getFullYear(), d.getMonth(), d.getDate(),
      now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()
    );
  }

  // Return UTC ISO without milliseconds
  const iso = d.toISOString();
  return iso.split('.')[0] + 'Z';
}
