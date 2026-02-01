// Quick Node script to compute total downloads for ag-grid-formatters
// Usage: node scripts/get-ag-grid-formatters-downloads.js

const pkg = "ag-grid-formatters";
// Set to your package publish date (format: YYYY-MM-DD)
// Update this date when you first published the package
const from = "2026-01-01"; // TODO: Update this to your actual publish date
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
