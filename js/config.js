// ═══════════════════════════════════════════════════════════════
//  config.js — Edit this file to connect your Google Sheet
// ═══════════════════════════════════════════════════════════════
//
//  QUICK START:
//    1. Leave USE_GOOGLE_SHEETS as false to use sample data first.
//    2. Once you see the dashboard working, follow Step 5 of the
//       guide to connect your real Google Sheet.
//
// ═══════════════════════════════════════════════════════════════

const CONFIG = {

    // ── Data Source ──────────────────────────────────────────
    // Set to true ONLY after you have published your Google Sheet
    // and pasted your SHEET_ID below.
    // ── Connected to your real Google Sheet ──────────────────
    USE_GOOGLE_SHEETS: true,

    // Your Google Sheet ID (extracted from the URL you provided)
    SHEET_ID: '1uEWLS_NlrJsOiX_SUf2PqcVl2Rk43vveDUkM3vms9J8',

    // Your sheet uses a SINGLE tab — all company + financial data in one place.
    // Row 1 = merged group headers (ignored)
    // Row 2 = Thai column headers  ← data.js reads from here
    // Row 3 = template/placeholder (skipped automatically)
    // Row 4+ = real company data

    // ── Display ───────────────────────────────────────────────
    DASHBOARD_TITLE: 'Executive Intelligence Dashboard',

    // Currency symbol shown before numbers
    // Examples: '฿'  '$'  '€'  '£'  'RM'  'S$'
    CURRENCY: '฿',

    // How to display large numbers:
    //   'million'  → 115,000,000 becomes ฿115.0M
    //   'thousand' → 115,000,000 becomes ฿115,000K
    //   'raw'      → shows the full number
    NUMBER_SCALE: 'million',

    // Decimal places shown on scaled numbers (e.g. ฿115.0M vs ฿115.00M)
    DECIMAL_PLACES: 1,
};
