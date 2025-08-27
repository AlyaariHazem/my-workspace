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
