// ═══════════════════════════════════════════════════════════════
//  app.js — Main application controller
// ═══════════════════════════════════════════════════════════════

const App = {

    state: {
        selectedId: null,
        search:     '',
        type:       '',
        score:      ''
    },

    // ── Boot ─────────────────────────────────────────────────
    async init() {
        document.title = CONFIG.DASHBOARD_TITLE;
        try {
            await DataService.init();
        } catch (e) {
            console.error('[App] DataService init failed:', e);
        }
        this._populateTypeFilter();
        this._renderList();
        this._updateWelcome();
        this._bindEvents();
    },

    // ── Sidebar population ───────────────────────────────────
    _populateTypeFilter() {
        const sel = document.getElementById('typeFilter');
        DataService.getBusinessTypes().forEach(t => {
            const opt = document.createElement('option');
            opt.value = opt.textContent = t;
            sel.appendChild(opt);
        });
    },

    _renderList() {
        const list     = document.getElementById('companyList');
        const countEl  = document.getElementById('companyCount');
        const filtered = DataService.filter(this.state);

        countEl.textContent = filtered.length;

        if (!filtered.length) {
            list.innerHTML = '<div class="no-results">No companies match your filters.</div>';
            return;
        }

        list.innerHTML = filtered.map(c => {
            const s     = Number(c.partnership_score);
            const grade = s >= 8 ? 'high' : s >= 5 ? 'medium' : 'low';
            const active = String(c.company_id) === String(this.state.selectedId) ? 'active' : '';
            return `<div class="company-item ${active}"
                        onclick="App.selectCompany('${c.company_id}')">
                        <span class="ci-name">${this._esc(c.company_name)}</span>
                        <div class="ci-meta">
                            <span class="ci-type">${this._esc(c.business_type || '—')}</span>
                            <span class="ci-score ${grade}">${s.toFixed(1)}</span>
                        </div>
                    </div>`;
        }).join('');
    },

    // ── Welcome stats ────────────────────────────────────────
    _updateWelcome() {
        document.getElementById('wTotalCompanies').textContent = DataService.getAll().length;
        document.getElementById('wAvgScore').textContent       = DataService.averageScore();
        document.getElementById('wTotalRevenue').textContent   = ChartService.fmtAuto(DataService.totalRevenue());
    },

    // ── Select company → render dashboard ───────────────────
    selectCompany(id) {
        this.state.selectedId = id;
        this._renderList();   // refresh active state
        this._renderDashboard(id);
        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
    },

    _renderDashboard(id) {
        const company    = DataService.getCompany(id);
        if (!company) return;
        const financials = DataService.getFinancials(id);
        const kpis       = DataService.getKPIs(company);

        // Swap screens
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dashboard').style.display     = 'block';
        document.querySelector('.main-area').scrollTop         = 0;

        // Top bar
        document.getElementById('dashCompanyName').textContent = company.company_name;
        document.getElementById('businessTypeBadge').textContent = company.business_type || '';
        document.getElementById('dataDate').textContent = `Data as of ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        // Year labels
        if (financials.length) {
            const period = `${financials[0].year} – ${financials[financials.length - 1].year}`;
            document.getElementById('kpiYear').textContent     = `Latest year: ${financials[financials.length - 1].year}`;
            document.getElementById('chartPeriod').textContent = period;
        }

        // Profile
        this._renderProfile(company);

        // KPIs
        this._renderKPIs(kpis, financials);

        // Charts (slight delay so the canvas has layout dimensions)
        setTimeout(() => {
            ChartService.destroyAll();
            ChartService.renderRevenue(financials);
            ChartService.renderProfit(financials);
            ChartService.renderGrowth(financials);
            ChartService.renderRadar(company, financials);
        }, 60);

        // Insights
        document.getElementById('insightsGrid').innerHTML = InsightsService.buildCards(company);

        // AI summary
        document.getElementById('aiBody').innerHTML = InsightsService.buildSummary(company, kpis, financials);

        // Footer date
        document.getElementById('footerDate').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    // ── Profile grid ─────────────────────────────────────────
    _renderProfile(company) {
        const fields = [
            { label: 'Company Name',           value: company.company_name },
            { label: 'Registration No.',        value: company.registration_number },
            { label: 'Business Type',           value: company.business_type },
            { label: 'Registered Capital',      value: company.registered_capital
                                                       ? `${CONFIG.CURRENCY}${company.registered_capital}` : '' },
            { label: 'Employees',               value: company.employees },
            { label: 'Website',                 value: company.website, type: 'url' },
            { label: 'Contact Person',          value: company.contact_person },
            { label: 'Phone',                   value: company.contact_phone },
            { label: 'Email',                   value: company.contact_email, type: 'email' },
            { label: 'Headquarters Address',    value: company.address },
            { label: 'Service Areas',           value: company.service_areas },
            { label: 'Customer Base',           value: company.customer_base },
            { label: 'Collaboration Type',      value: company.collaboration_type },
            { label: 'Responsible Business Unit', value: company.business_unit },
        ];

        document.getElementById('profileGrid').innerHTML = fields
            .filter(f => f.value)
            .map(f => {
                let val = this._esc(f.value);
                if (f.type === 'url')   val = `<a href="${this._esc(f.value)}" target="_blank" rel="noopener noreferrer">${val}</a>`;
                if (f.type === 'email') val = `<a href="mailto:${this._esc(f.value)}">${val}</a>`;
                return `<div class="pf">
                            <span class="pf-lbl">${f.label}</span>
                            <span class="pf-val">${val}</span>
                        </div>`;
            }).join('');
    },

    // ── KPI cards ────────────────────────────────────────────
    _renderKPIs(kpis, financials) {
        if (!kpis) {
            document.getElementById('kpiGrid').innerHTML =
                '<p style="color:var(--txt-3);font-size:13px;">No financial data available for this company.</p>';
            return;
        }

        const pct = (v) => v !== null
            ? `${v >= 0 ? '▲' : '▼'} ${Math.abs(v)}%`
            : '—';

        const cards = [
            {
                icon:   '💰',
                color:  'c-blue',
                value:  ChartService.fmt(kpis.latestRevenue),
                label:  `Revenue (${kpis.latestYear})`,
                trend:  pct(kpis.revenueGrowth),
                tclass: kpis.revenueGrowth >= 0 ? 'trend-up' : 'trend-down'
            },
            {
                icon:   '📈',
                color:  'c-green',
                value:  ChartService.fmt(kpis.latestProfit),
                label:  `Net Profit (${kpis.latestYear})`,
                trend:  pct(kpis.profitGrowth),
                tclass: kpis.profitGrowth >= 0 ? 'trend-up' : 'trend-down'
            },
            {
                icon:   '📊',
                color:  'c-orange',
                value:  kpis.revenueGrowth !== null ? `${kpis.revenueGrowth}%` : '—',
                label:  'Revenue Growth YoY',
                trend:  kpis.revenueGrowth >= 15 ? '● Strong' : kpis.revenueGrowth >= 5 ? '● Steady' : kpis.revenueGrowth >= 0 ? '● Modest' : '● Declining',
                tclass: kpis.revenueGrowth >= 5 ? 'trend-up' : kpis.revenueGrowth >= 0 ? 'trend-flat' : 'trend-down'
            },
            {
                icon:   '💹',
                color:  'c-teal',
                value:  kpis.profitGrowth !== null ? `${kpis.profitGrowth}%` : '—',
                label:  'Profit Growth YoY',
                trend:  kpis.profitGrowth >= 15 ? '● Strong' : kpis.profitGrowth >= 5 ? '● Steady' : kpis.profitGrowth >= 0 ? '● Modest' : '● Declining',
                tclass: kpis.profitGrowth >= 5 ? 'trend-up' : kpis.profitGrowth >= 0 ? 'trend-flat' : 'trend-down'
            },
            {
                icon:   '🤝',
                color:  'c-purple',
                value:  `${kpis.partnershipScore.toFixed(1)} / 10`,
                label:  'Partnership Score',
                trend:  kpis.partnershipScore >= 8 ? '● High priority' : kpis.partnershipScore >= 5 ? '● Medium priority' : '● Low priority',
                tclass: kpis.partnershipScore >= 8 ? 'trend-up' : kpis.partnershipScore >= 5 ? 'trend-flat' : 'trend-down'
            },
            {
                icon:   '🎯',
                color:  'c-pink',
                value:  `${kpis.strategicFit.toFixed(1)} / 10`,
                label:  'Strategic Fit',
                trend:  kpis.strategicFit >= 8 ? '● Excellent fit' : kpis.strategicFit >= 5 ? '● Good fit' : '● Partial fit',
                tclass: kpis.strategicFit >= 8 ? 'trend-up' : kpis.strategicFit >= 5 ? 'trend-flat' : 'trend-down'
            }
        ];

        document.getElementById('kpiGrid').innerHTML = cards.map(c => `
            <div class="kpi-card ${c.color}">
                <span class="kpi-icon">${c.icon}</span>
                <div class="kpi-val">${c.value}</div>
                <div class="kpi-lbl">${c.label}</div>
                <div class="kpi-trend ${c.tclass}">${c.trend}</div>
            </div>`).join('');
    },

    // ── Event bindings ───────────────────────────────────────
    _bindEvents() {
        document.getElementById('searchInput').addEventListener('input', e => {
            this.state.search = e.target.value;
            this._renderList();
        });

        document.getElementById('typeFilter').addEventListener('change', e => {
            this.state.type = e.target.value;
            this._renderList();
        });

        document.getElementById('scoreFilter').addEventListener('change', e => {
            this.state.score = e.target.value;
            this._renderList();
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            this.state.selectedId = null;
            document.getElementById('welcomeScreen').style.display = 'flex';
            document.getElementById('dashboard').style.display     = 'none';
            ChartService.destroyAll();
            this._renderList();
        });

        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebarOverlay').classList.toggle('open');
        });
    },

    _esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};

// ── Close sidebar from outside (overlay click) ───────────────
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
}

// ── Start ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
