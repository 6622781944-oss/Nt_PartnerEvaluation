// ═══════════════════════════════════════════════════════════════
//  charts.js — All Chart.js rendering (dark Power BI theme)
// ═══════════════════════════════════════════════════════════════

const ChartService = {

    _instances: {},

    // ── Format a number for individual company display ───────
    fmt(value) {
        const v   = Number(value) || 0;
        const cur = CONFIG.CURRENCY;
        const dp  = CONFIG.DECIMAL_PLACES ?? 1;
        switch (CONFIG.NUMBER_SCALE) {
            case 'million':  return `${cur}${(v / 1e6).toFixed(dp)}M`;
            case 'thousand': return `${cur}${(v / 1e3).toFixed(0)}K`;
            default:         return `${cur}${v.toLocaleString()}`;
        }
    },

    // ── Auto-scale for large aggregates (welcome screen) ────
    fmtAuto(value) {
        const v   = Math.abs(Number(value) || 0);
        const cur = CONFIG.CURRENCY;
        if      (v >= 1e12) return `${cur}${(value / 1e12).toFixed(2)}T`;
        else if (v >= 1e9)  return `${cur}${(value / 1e9).toFixed(1)}B`;
        else if (v >= 1e6)  return `${cur}${(value / 1e6).toFixed(1)}M`;
        else if (v >= 1e3)  return `${cur}${(value / 1e3).toFixed(0)}K`;
        else                return `${cur}${value.toLocaleString()}`;
    },

    // ── Destroy a chart by key ───────────────────────────────
    destroy(key) {
        if (this._instances[key]) {
            this._instances[key].destroy();
            delete this._instances[key];
        }
    },

    destroyAll() {
        Object.keys(this._instances).forEach(k => this.destroy(k));
    },

    // ── Shared Chart.js defaults (dark theme) ───────────────
    _base() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500, easing: 'easeInOutQuart' },
            plugins: {
                legend: {
                    labels: {
                        color: '#8b949e',
                        font:  { family: 'Inter', size: 11 },
                        usePointStyle: true,
                        pointStyleWidth: 8,
                        padding: 16
                    }
                },
                tooltip: {
                    backgroundColor: '#21262d',
                    borderColor:     '#30363d',
                    borderWidth:     1,
                    titleColor:      '#e6edf3',
                    bodyColor:       '#8b949e',
                    padding:         12,
                    titleFont:       { family: 'Inter', size: 12, weight: '600' },
                    bodyFont:        { family: 'Inter', size: 12 },
                    displayColors:   true,
                    boxPadding:      4
                }
            },
            scales: {
                x: {
                    grid:  { color: 'rgba(48,54,61,.6)', drawBorder: false },
                    ticks: { color: '#6e7681', font: { family: 'Inter', size: 11 }, maxRotation: 0 }
                },
                y: {
                    grid:  { color: 'rgba(48,54,61,.6)', drawBorder: false },
                    ticks: { color: '#6e7681', font: { family: 'Inter', size: 11 } }
                }
            }
        };
    },

    // ── Revenue Line Chart ───────────────────────────────────
    renderRevenue(financials) {
        this.destroy('revenue');
        const ctx = document.getElementById('revenueChart');
        if (!ctx || !financials.length) return;

        const self = this;
        this._instances.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: financials.map(f => f.year),
                datasets: [{
                    label: 'Revenue',
                    data:  financials.map(f => f.revenue),
                    borderColor:      '#388bfd',
                    backgroundColor:  'rgba(56,139,253,.1)',
                    fill:             true,
                    tension:          0.4,
                    pointBackgroundColor: '#388bfd',
                    pointBorderColor:     '#0d1117',
                    pointBorderWidth:     2,
                    pointRadius:          5,
                    pointHoverRadius:     7,
                    borderWidth:          2
                }]
            },
            options: {
                ...this._base(),
                plugins: {
                    ...this._base().plugins,
                    tooltip: {
                        ...this._base().plugins.tooltip,
                        callbacks: { label: ctx => ` Revenue: ${self.fmt(ctx.raw)}` }
                    }
                },
                scales: {
                    ...this._base().scales,
                    y: { ...this._base().scales.y,
                         ticks: { ...this._base().scales.y.ticks,
                                  callback: v => self.fmt(v) } }
                }
            }
        });
    },

    // ── Net Profit Line Chart ────────────────────────────────
    renderProfit(financials) {
        this.destroy('profit');
        const ctx = document.getElementById('profitChart');
        if (!ctx || !financials.length) return;

        const self = this;
        this._instances.profit = new Chart(ctx, {
            type: 'line',
            data: {
                labels: financials.map(f => f.year),
                datasets: [{
                    label: 'Net Profit',
                    data:  financials.map(f => f.net_profit),
                    borderColor:      '#3fb950',
                    backgroundColor:  'rgba(63,185,80,.1)',
                    fill:             true,
                    tension:          0.4,
                    pointBackgroundColor: '#3fb950',
                    pointBorderColor:     '#0d1117',
                    pointBorderWidth:     2,
                    pointRadius:          5,
                    pointHoverRadius:     7,
                    borderWidth:          2
                }]
            },
            options: {
                ...this._base(),
                plugins: {
                    ...this._base().plugins,
                    tooltip: {
                        ...this._base().plugins.tooltip,
                        callbacks: { label: ctx => ` Net Profit: ${self.fmt(ctx.raw)}` }
                    }
                },
                scales: {
                    ...this._base().scales,
                    y: { ...this._base().scales.y,
                         ticks: { ...this._base().scales.y.ticks,
                                  callback: v => self.fmt(v) } }
                }
            }
        });
    },

    // ── YoY Growth Bar Chart ─────────────────────────────────
    renderGrowth(financials) {
        this.destroy('growth');
        const ctx = document.getElementById('growthChart');
        if (!ctx || financials.length < 2) return;

        const labels = [], revG = [], proG = [];
        for (let i = 1; i < financials.length; i++) {
            const cur = financials[i], prv = financials[i - 1];
            labels.push(cur.year);
            revG.push(prv.revenue    ? +((cur.revenue    - prv.revenue)    / prv.revenue    * 100).toFixed(1) : 0);
            proG.push(prv.net_profit ? +((cur.net_profit - prv.net_profit) / prv.net_profit * 100).toFixed(1) : 0);
        }

        this._instances.growth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Revenue Growth %',
                        data:  revG,
                        backgroundColor: 'rgba(56,139,253,.75)',
                        borderColor:     '#388bfd',
                        borderWidth:     1,
                        borderRadius:    4,
                        borderSkipped:   false
                    },
                    {
                        label: 'Profit Growth %',
                        data:  proG,
                        backgroundColor: 'rgba(63,185,80,.75)',
                        borderColor:     '#3fb950',
                        borderWidth:     1,
                        borderRadius:    4,
                        borderSkipped:   false
                    }
                ]
            },
            options: {
                ...this._base(),
                plugins: {
                    ...this._base().plugins,
                    tooltip: {
                        ...this._base().plugins.tooltip,
                        callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%` }
                    }
                }
            }
        });
    },

    // ── Performance Radar Chart ──────────────────────────────
    renderRadar(company, financials) {
        this.destroy('radar');
        const ctx = document.getElementById('radarChart');
        if (!ctx) return;

        const kpis = DataService.getKPIs(company);
        const partnerScore  = kpis ? kpis.partnershipScore : 0;
        const strategicFit  = kpis ? kpis.strategicFit     : 0;
        const financialHlth = this._scoreFinancialHealth(financials);
        const growthMoment  = this._scoreGrowthMomentum(financials);
        const innovScore    = this._scoreInnovation(company);

        this._instances.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Partnership', 'Strategic Fit', 'Financial Health', 'Growth Momentum', 'Innovation'],
                datasets: [{
                    label:            company.company_name,
                    data:             [partnerScore, strategicFit, financialHlth, growthMoment, innovScore],
                    borderColor:      '#388bfd',
                    backgroundColor:  'rgba(56,139,253,.15)',
                    pointBackgroundColor: '#388bfd',
                    pointBorderColor:     '#0d1117',
                    pointBorderWidth: 2,
                    pointRadius:      4,
                    borderWidth:      2
                }]
            },
            options: {
                responsive:          true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#21262d', borderColor: '#30363d', borderWidth: 1,
                        titleColor: '#e6edf3', bodyColor: '#8b949e', padding: 10,
                        callbacks: { label: ctx => ` Score: ${ctx.raw.toFixed(1)} / 10` }
                    }
                },
                scales: {
                    r: {
                        min: 0, max: 10, stepSize: 2,
                        grid:        { color: 'rgba(48,54,61,.7)' },
                        angleLines:  { color: 'rgba(48,54,61,.7)' },
                        pointLabels: { color: '#8b949e', font: { family: 'Inter', size: 10 } },
                        ticks: {
                            color: '#484f58', font: { family: 'Inter', size: 9 },
                            stepSize: 2, backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
    },

    // ── Score calculators for Radar ──────────────────────────
    _scoreFinancialHealth(financials) {
        if (financials.length < 2) return 5;
        const latest = financials[financials.length - 1];
        const margin  = latest.revenue > 0 ? latest.net_profit / latest.revenue : 0;
        return Math.min(10, Math.max(1, 4 + margin * 30));
    },

    _scoreGrowthMomentum(financials) {
        if (financials.length < 2) return 5;
        const latest = financials[financials.length - 1];
        const prev   = financials[financials.length - 2];
        const g = prev.revenue > 0 ? (latest.revenue - prev.revenue) / prev.revenue * 100 : 0;
        return Math.min(10, Math.max(1, 5 + g / 10));
    },

    _scoreInnovation(company) {
        const text = ((company.future_plans || '') + ' ' + (company.products || '')).toLowerCase();
        const keywords = ['ai', 'digital', 'tech', 'innovation', 'smart', 'platform',
                          'cloud', 'data', 'analytics', 'automation', 'iot', 'api', 'saas'];
        const hits = keywords.filter(k => text.includes(k)).length;
        return Math.min(10, 3 + hits * 0.65);
    }
};
