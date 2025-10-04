export function sortStringComparator(a: any, b: any): number {
  // null/empty safety
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  const sa = String(a).trim();
  const sb = String(b).trim();

  const numRe = /^\d+$/;
  const aIsNum = numRe.test(sa);
  const bIsNum = numRe.test(sb);

  if (aIsNum && bIsNum) {
    // numeric compare
    return parseInt(sa, 10) - parseInt(sb, 10);
  }

  // (optional) numeric codes before alpha codes
  if (aIsNum && !bIsNum) return -1;
  if (!aIsNum && bIsNum) return 1;

  // natural alphanumeric compare (DPT-7 < DPT-12, DPT-007 ~ DPT-7)
  return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' });
};
