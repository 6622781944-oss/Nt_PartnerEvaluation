// ═══════════════════════════════════════════════════════════════
//  data.js — Loads from your real Google Sheet
//
//  Sheet structure (single tab):
//    Row 1  — merged group headers (ignored by gviz)
//    Row 2  — Thai sub-column headers  ← fetched as header row
//    Row 3  — template/placeholder row (skipped)
//    Row 4+ — real company data
//
//  Column layout (A=0 … AC=28 when fetching from row 2):
//    0  A  ลำดับ               → company_id
//    1  B  วันที่               → date_added
//    2  C  ชื่อบริษัท          → company_name
//    3  D  เลขทะเบียนนิติบุคคล → registration_number
//    4  E  ที่อยู่สำนักงานใหญ่  → address
//    5  F  เว็ปไซต์            → website
//    6  G  ผู้ประสานงานหลัก    → contact_person
//    7  H  เบอร์โทรศัพท์       → contact_phone
//    8  I  อีเมล์              → contact_email
//    9  J  ประเภทธุรกิจ        → business_type
//   10  K  สินค้าและบริการหลัก → products
//   11  L  ทุนจดทะเบียน        → registered_capital
//   12  M  จำนวนพนักงาน        → employees
//   13  N  สาขาและพื้นที่ฯ     → service_areas
//   14  O  ฐานลูกค้า           → customer_base
//   15  P  คู่แข่งที่สำคัญ     → competitors
//   16  Q  ประเภทความร่วมมือ   → collaboration_type
//   17  R  หน่วยธุรกิจที่รับผิดชอบ → business_unit
//   18  S  รูปแบบความร่วมมือฯ  → current_collaboration
//   19  T  ประวัติการทำงานร่วมกัน → collaboration_history
//   20  U  ผลการดำเนินการ      → performance_results
//   21  V  ความคิดเห็นและประสบการณ์ → comments
//   22  W  รายได้ย้อนหลัง      → revenue_text  (multi-line, Buddhist years)
//   23  X  กำไรสุทธิย้อนหลัง  → profit_text   (multi-line, Buddhist years)
//   24  Y  อัตราส่วนทางการเงิน → financial_ratios
//   25  Z  แนวโน้มการเติบโต    → growth_trend
//   26  AA โอกาสขยายความร่วมมือ → expansion_opportunities
//   27  AB แผนธุรกิจร่วมกัน    → joint_business_plan
//   28  AC ความสอดคล้องกับยุทธศาสตร์ → strategic_alignment
// ═══════════════════════════════════════════════════════════════

const COL = {
    id:           0,
    date:         1,
    name:         2,
    reg_no:       3,
    address:      4,
    website:      5,
    contact:      6,
    phone:        7,
    email:        8,
    biz_type:     9,
    products:     10,
    capital:      11,
    employees:    12,
    areas:        13,
    customers:    14,
    competitors:  15,
    collab_type:  16,
    biz_unit:     17,
    collab_now:   18,
    collab_hist:  19,
    performance:  20,
    comments:     21,
    revenue_txt:  22,
    profit_txt:   23,
    fin_ratios:   24,
    growth_trend: 25,
    expansion:    26,
    joint_plan:   27,
    strategy:     28,
};

const DataService = {

    companies: [],

    // ── Boot ─────────────────────────────────────────────────
    async init() {
        if (CONFIG.USE_GOOGLE_SHEETS) {
            try {
                await this._loadFromSheets();
                console.log(`[DataService] ✅ Loaded ${this.companies.length} companies from Google Sheets.`);
            } catch (err) {
                console.error('[DataService] ❌ Google Sheets failed:', err.message);
                this._showSheetError(err.message);
                this._loadDemo();
            }
        } else {
            this._loadDemo();
        }
    },

    // ── Show visible error banner ────────────────────────────
    _showSheetError(msg) {
        const banner = document.createElement('div');
        banner.style.cssText = `
            position:fixed; top:0; left:0; right:0; z-index:9999;
            background:#f85149; color:#fff; font-family:Inter,sans-serif;
            font-size:13px; padding:10px 20px;
            display:flex; align-items:center; justify-content:space-between;
        `;
        banner.innerHTML = `
            <span>⚠️ Google Sheets failed to load — showing demo data instead.
            Error: <strong>${msg}</strong> —
            Make sure the sheet is published (File → Share → Publish to web).</span>
            <button onclick="this.parentElement.remove()"
                style="background:none;border:1px solid rgba(255,255,255,.5);
                color:#fff;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:12px;">
                Dismiss
            </button>`;
        document.body.prepend(banner);
    },

    // ── Google Sheets loader ─────────────────────────────────
    async _loadFromSheets() {
        // Fetch starting from row 2 so the Thai sub-headers become column labels.
        // gviz will treat the first row of this range (row 2) as headers.
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&range=A2:AC`;
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();

        // Strip the JSONP wrapper Google adds
        const start = text.indexOf('{');
        const end   = text.lastIndexOf('}');
        if (start === -1) throw new Error('Unexpected response from Google Sheets');
        const json = JSON.parse(text.substring(start, end + 1));

        const rows = json.table?.rows || [];
        this.companies = [];
        let autoId = 1;

        rows.forEach(row => {
            const get = (colIdx) => {
                const cell = row.c?.[colIdx];
                if (!cell || cell.v === null || cell.v === undefined) return '';
                return String(cell.v).trim();
            };

            const name = get(COL.name);

            // Skip template rows, blank rows, and header bleed-through
            if (!name || name === 'ชื่อบริษัท' || name === 'บริษัท' || name === 'Company Name') return;

            const revText  = get(COL.revenue_txt);
            const profText = get(COL.profit_txt);
            const financials = this._parseFinancials(revText, profText);

            const company = {
                company_id:             String(autoId++),  // always sequential 1,2,3...
                sheet_id:               get(COL.id),       // original column A value
                company_name:           name,
                registration_number:    get(COL.reg_no),
                address:                get(COL.address),
                website:                get(COL.website),
                contact_person:         get(COL.contact),
                contact_phone:          get(COL.phone),
                contact_email:          get(COL.email),
                business_type:          get(COL.biz_type),
                products:               get(COL.products),
                registered_capital:     get(COL.capital),
                employees:              get(COL.employees),
                service_areas:          get(COL.areas),
                customer_base:          get(COL.customers),
                competitors:            get(COL.competitors),
                collaboration_type:     get(COL.collab_type),
                business_unit:          get(COL.biz_unit),
                current_collaboration:  get(COL.collab_now),
                collaboration_history:  get(COL.collab_hist),
                performance_results:    get(COL.performance),
                comments:               get(COL.comments),
                financial_ratios:       get(COL.fin_ratios),
                growth_trend:           get(COL.growth_trend),
                expansion_opportunities: get(COL.expansion),
                joint_business_plan:    get(COL.joint_plan),
                strategic_alignment:    get(COL.strategy),
                _financials:            financials,
            };

            // Derive partnership & strategic fit scores from available data
            company.partnership_score   = this._derivePartnerScore(company);
            company.strategic_fit_score = this._deriveStrategicScore(company);

            this.companies.push(company);
        });

        if (this.companies.length === 0) throw new Error('No company rows found in sheet');
    },

    // ── Parse multi-line revenue/profit text ─────────────────
    // Input:  "ปี 2563 131,546,262.72\nปี 2564 28,229,710.37\n..."
    // Output: [{ year: 2020, revenue: 131546262.72, net_profit: ... }, ...]
    // Note:   Thai Buddhist years — subtract 543 to get CE year.
    _parseFinancials(revText, profText) {
        const parseBlock = (text) => {
            const map = {};
            if (!text) return map;
            const lines = text.split(/\r?\n/);
            lines.forEach(line => {
                // Match: ปี YYYY  1,234,567.89  (with optional spaces/formatting)
                const m = line.match(/ปี\s*(\d{4})\s+([\d,.\-]+)/);
                if (m) {
                    const buddhistYear = parseInt(m[1], 10);
                    const ceYear       = buddhistYear > 2400 ? buddhistYear - 543 : buddhistYear;
                    const value        = parseFloat(m[2].replace(/,/g, '')) || 0;
                    map[ceYear]        = value;
                }
            });
            return map;
        };

        const revMap  = parseBlock(revText);
        const profMap = parseBlock(profText);
        const years   = [...new Set([...Object.keys(revMap), ...Object.keys(profMap)])]
                            .map(Number).sort((a, b) => a - b);

        return years.map(yr => ({
            year:       yr,
            revenue:    revMap[yr]  ?? 0,
            net_profit: profMap[yr] ?? 0,
        }));
    },

    // ── Derive partnership score (0–10) ──────────────────────
    // Based on depth of relationship data present in the sheet.
    _derivePartnerScore(company) {
        let score = 3.5; // base for any listed company

        // Active collaboration signals
        if (company.collaboration_type)    score += 1.5;
        if (company.current_collaboration) score += 1.5;
        if (company.performance_results)   score += 0.5;
        if (company.collaboration_history) score += 0.5;

        // Future potential signals
        if (company.expansion_opportunities) score += 1.0;
        if (company.joint_business_plan)     score += 0.5;

        // Revenue trend modifier
        const fin = company._financials;
        if (fin.length >= 2) {
            const last = fin[fin.length - 1];
            const prev = fin[fin.length - 2];
            if (prev.revenue > 0) {
                const g = (last.revenue - prev.revenue) / prev.revenue;
                if      (g >  0.30) score += 1.0;
                else if (g >  0.10) score += 0.5;
                else if (g < -0.20) score -= 0.5;
            }
        }

        return +(Math.min(10, Math.max(1, score)).toFixed(1));
    },

    // ── Derive strategic fit score (0–10) ───────────────────
    _deriveStrategicScore(company) {
        let score = 3.5;
        if (company.strategic_alignment)     score += 2.5;
        if (company.collaboration_type)      score += 1.0;
        if (company.expansion_opportunities) score += 1.5;
        if (company.joint_business_plan)     score += 1.5;
        return +(Math.min(10, Math.max(1, score)).toFixed(1));
    },

    // ── Demo data fallback ───────────────────────────────────
    _loadDemo() {
        this.companies = DEMO_DATA.companies.map(c => ({
            ...c,
            _financials: DEMO_DATA.financials
                .filter(f => String(f.company_id) === String(c.company_id))
                .sort((a, b) => a.year - b.year),
        }));
    },

    // ── Public API ───────────────────────────────────────────
    getAll() {
        return this.companies;
    },

    getCompany(id) {
        return this.companies.find(c => String(c.company_id) === String(id));
    },

    getFinancials(id) {
        const c = this.getCompany(id);
        return c ? (c._financials || []) : [];
    },

    getBusinessTypes() {
        return [...new Set(this.companies.map(c => c.business_type).filter(Boolean))].sort();
    },

    filter({ search = '', type = '', score = '' } = {}) {
        return this.companies.filter(c => {
            if (search && !c.company_name.toLowerCase().includes(search.toLowerCase())) return false;
            if (type   && c.business_type !== type) return false;
            if (score) {
                const s = Number(c.partnership_score);
                if (score === 'high'   && !(s >= 8))          return false;
                if (score === 'medium' && !(s >= 5 && s < 8)) return false;
                if (score === 'low'    && !(s < 5))           return false;
            }
            return true;
        });
    },

    getKPIs(company) {
        const fin = this.getFinancials(company.company_id);
        if (!fin.length) return null;

        const latest = fin[fin.length - 1];
        const prev   = fin.length > 1 ? fin[fin.length - 2] : null;

        const pct = (cur, old) =>
            old && old !== 0 ? +((cur - old) / old * 100).toFixed(1) : null;

        return {
            latestYear:       latest.year,
            latestRevenue:    latest.revenue,
            latestProfit:     latest.net_profit,
            revenueGrowth:    prev ? pct(latest.revenue,    prev.revenue)    : null,
            profitGrowth:     prev ? pct(latest.net_profit, prev.net_profit) : null,
            partnershipScore: Number(company.partnership_score)   || 0,
            strategicFit:     Number(company.strategic_fit_score) || 0,
        };
    },

    totalRevenue() {
        return this.companies.reduce((sum, c) => {
            const fin = c._financials || [];
            if (!fin.length) return sum;
            return sum + fin[fin.length - 1].revenue;
        }, 0);
    },

    averageScore() {
        if (!this.companies.length) return '—';
        const sum = this.companies.reduce((s, c) => s + Number(c.partnership_score || 0), 0);
        return (sum / this.companies.length).toFixed(1);
    },
};
