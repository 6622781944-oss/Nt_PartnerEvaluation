// ═══════════════════════════════════════════════════════════════
//  insights.js — Builds insight cards and AI executive summary
// ═══════════════════════════════════════════════════════════════

const InsightsService = {

    // ── Six strategic insight cards ──────────────────────────
    buildCards(company) {
        const cards = [
            {
                icon:    '📦',
                bg:      'rgba(56,139,253,.15)',
                title:   'Products & Services',
                content: company.products || '—',
                mode:    'tags'
            },
            {
                icon:    '🤝',
                bg:      'rgba(57,197,207,.15)',
                title:   'Collaboration Type',
                content: company.collaboration_type || '—',
                mode:    'tags'
            },
            {
                icon:    '🔄',
                bg:      'rgba(63,185,80,.15)',
                title:   'Current Collaboration',
                content: company.current_collaboration || '—',
                mode:    'text'
            },
            {
                icon:    '🚀',
                bg:      'rgba(163,113,247,.15)',
                title:   'Expansion Opportunities',
                content: company.expansion_opportunities || '—',
                mode:    'text'
            },
            {
                icon:    '🎯',
                bg:      'rgba(210,153,34,.15)',
                title:   'Strategic Alignment',
                content: company.strategic_alignment || '—',
                mode:    'text'
            },
            {
                icon:    '📋',
                bg:      'rgba(248,81,73,.15)',
                title:   'Joint Business Plan',
                content: company.joint_business_plan || '—',
                mode:    'text'
            }
        ];

        return cards.map(card => {
            const body = card.mode === 'tags' && card.content !== '—'
                ? `<div class="insight-tags">${
                    card.content.split(',')
                        .map(t => t.trim()).filter(Boolean)
                        .map(t => `<span class="insight-tag">${this._esc(t)}</span>`)
                        .join('')
                  }</div>`
                : `<p class="insight-text">${this._esc(card.content)}</p>`;

            return `
                <div class="insight-card">
                    <div class="insight-card-hd">
                        <div class="insight-ico" style="background:${card.bg}">${card.icon}</div>
                        <span class="insight-ttl">${card.title}</span>
                    </div>
                    ${body}
                </div>`;
        }).join('');
    },

    // ── AI executive summary ─────────────────────────────────
    buildSummary(company, kpis, financials) {
        const name   = this._esc(company.company_name);
        const type   = this._esc(company.business_type || 'general');
        const yr     = kpis?.latestYear || '—';
        const rev    = kpis ? ChartService.fmt(kpis.latestRevenue) : '—';
        const pft    = kpis ? ChartService.fmt(kpis.latestProfit)  : '—';
        const rg     = kpis?.revenueGrowth;
        const pg     = kpis?.profitGrowth;
        const ps     = kpis?.partnershipScore ?? 0;
        const sf     = kpis?.strategicFit     ?? 0;

        // Para 1 — Financial headline
        const growthPhrase = rg !== null
            ? (rg > 25 ? `exceptional revenue growth of <span class="ai-hi-blue">${rg}%</span>`
             : rg > 15 ? `strong revenue growth of <span class="ai-hi-blue">${rg}%</span>`
             : rg > 5  ? `steady revenue growth of <span class="ai-hi-blue">${rg}%</span>`
             : rg > 0  ? `modest revenue growth of <span class="ai-hi-blue">${rg}%</span>`
                       : `a revenue contraction of <span class="ai-hi-blue">${Math.abs(rg)}%</span>`)
            : 'stable financial performance';

        const profitNote = pg !== null
            ? ` Net profit ${pg >= 0 ? 'grew' : 'declined'} by <span class="ai-hi">${Math.abs(pg)}%</span> YoY to ${pft}.`
            : '';

        // Para 2 — Long-term trend
        let trendPara = '';
        if (financials.length >= 3) {
            const first      = financials[0];
            const last       = financials[financials.length - 1];
            const totalGrowth = first.revenue > 0
                ? +((last.revenue - first.revenue) / first.revenue * 100).toFixed(0)
                : 0;
            const years       = last.year - first.year;
            const cagr        = first.revenue > 0
                ? +((Math.pow(last.revenue / first.revenue, 1 / years) - 1) * 100).toFixed(1)
                : null;
            trendPara = `<p>Over the <span class="ai-hi">${years}-year period from ${first.year} to ${last.year}</span>,
                the company grew cumulative revenue by <span class="ai-hi-blue">${totalGrowth}%</span>${
                cagr ? `, representing a CAGR of <span class="ai-hi">${cagr}%</span>` : ''
                }. This trajectory indicates ${totalGrowth > 100 ? 'high-growth momentum' : totalGrowth > 30 ? 'consistent expansion' : 'gradual market development'}.</p>`;
        }

        // Para 3 — Scores
        const partnerAssess = ps >= 9 ? 'an exceptional partnership target'
                            : ps >= 7 ? 'a strong partnership candidate'
                            : ps >= 5 ? 'a viable partnership candidate'
                            :           'an early-stage partnership prospect';

        const strengths = company.products
            ? company.products.split(/[,\n]/).slice(0, 3).map(s => s.trim()).filter(Boolean).join(', ')
            : 'operational expertise and market positioning';

        // Para 4 — Recommendation
        const recPhrase = ps >= 8
            ? `<span class="ai-hi-blue">Priority Engage</span> — initiate formal partnership discussions and develop a concrete collaboration framework in the near term.`
            : ps >= 6
            ? `<span class="ai-hi">Qualify Further</span> — conduct structured due diligence and identify one or two specific collaboration entry points to test alignment.`
            : `<span class="ai-hi">Monitor</span> — track the company's development over the next 12 months and re-evaluate as the strategic landscape evolves.`;

        return `
            <p><span class="ai-hi">${name}</span> is a <span class="ai-hi">${type}</span> sector company
            demonstrating ${growthPhrase} in <span class="ai-hi">${yr}</span>, reporting total revenue of
            <span class="ai-hi-blue">${rev}</span>.${profitNote}</p>

            ${trendPara}

            <p>The company is assessed as <span class="ai-hi">${partnerAssess}</span>, scoring
            <span class="ai-hi-blue">${ps}/10</span> on Partnership and
            <span class="ai-hi-blue">${sf}/10</span> on Strategic Fit.
            Primary products and services include <span class="ai-hi">${this._esc(strengths)}</span>.
            Strategic collaboration potential is strongest through
            <span class="ai-hi">${this._esc(company.collaboration_type || company.expansion_opportunities || 'joint development and technology integration')}</span>.</p>

            <p><strong>Recommendation: ${recPhrase}</strong></p>`;
    },

    // ── Escape HTML to prevent injection ────────────────────
    _esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};
