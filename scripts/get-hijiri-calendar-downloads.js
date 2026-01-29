// Quick Node script to compute total downloads for hijiri-calendar
// Usage: node scripts/get-hijiri-calendar-downloads.js

const pkg = "hijiri-calendar";
// Set to your package publish date (format: YYYY-MM-DD)
// Update this date when you first published the package
// Based on npm page: published ~25 days ago (around early January 2026)
const from = "2026-01-04"; // TODO: Update this to your actual publish date
const to = new Date().toISOString().split('T')[0]; // Today's date

const url = `https://api.npmjs.org/downloads/range/${from}:${to}/${pkg}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const total = (data.downloads ?? []).reduce((sum, d) => sum + (d.downloads || 0), 0);
    console.log({ from, to, pkg, total });
  })
  .catch(err => {
    console.error('Error fetching download data:', err);
  });
