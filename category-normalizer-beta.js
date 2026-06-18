// ═══════════════════════════════════════════════════════════════
//  category-normalizer-beta.js  (v3 — normalization only)
//  This is a normalization task, not a classification task.
// ═══════════════════════════════════════════════════════════════

const CategoryNormalizerBeta = {

    APPROVED_CATEGORIES: [
        'AI / Machine Learning',
        'Cloud / Data Center / Liquid Cooling',
        'Wireless/Wifi',
        'Fixed line/Broadband/ท่อร้อยสาย',
        'ระบบเคเบิลใต้น้ำ',
        'ดาวเทียม',
        'IT/Digital Solution/Cyber Security/Smart xxx',
        'โดรน/UAV',
        'อสังหาริมทรัพย์',
        'Blockchain',
        'อื่นๆ',
    ],

    _key(str) {
        return str.replace(/\s+/g, '').toLowerCase();
    },

    _buildLookup() {
        if (this._lookup) return;
        this._lookup = {};
        for (const cat of this.APPROVED_CATEGORIES) {
            this._lookup[this._key(cat)] = cat;
        }
    },

    _matchToken(rawToken) {
        this._buildLookup();
        return this._lookup[this._key(rawToken)] ?? null;
    },

    normalize(company) {
        const raw = (company.business_type || '').trim();
        if (!raw) return [];
        const tokens  = raw.split(',').map(t => t.trim()).filter(Boolean);
        const matched = [];
        const seen    = new Set();
        for (const token of tokens) {
            const canonical = this._matchToken(token);
            if (canonical && !seen.has(canonical)) {
                matched.push(canonical);
                seen.add(canonical);
            }
        }
        return matched;
    },

    getMasterList() {
        return [...this.APPROVED_CATEGORIES];
    },

    filterCompanies(companies, category) {
        if (!category) return companies;
        return companies.filter(c => this.normalize(c).includes(category));
    },

    compareCompany(company) {
        const raw        = (company.business_type || '').trim();
        const normalised = this.normalize(company);
        const isAlreadyCanonical = normalised.length === 1 && normalised[0] === raw;
        const isAlreadyMulti = normalised.length > 1 && raw === normalised.join(', ');
        return {
            company_name:    company.company_name,
            raw_value:       raw || '(empty)',
            normalised_cats: normalised,
            unmatched_tokens: this._unmatchedTokens(raw),
            changed:         !isAlreadyCanonical && !isAlreadyMulti,
        };
    },

    report(companies) {
        const masterList  = this.getMasterList();
        const comparisons = companies.map(c => this.compareCompany(c));
        const catCounts = {};
        masterList.forEach(cat => { catCounts[cat] = 0; });
        companies.forEach(c => {
            this.normalize(c).forEach(cat => {
                if (catCounts[cat] !== undefined) catCounts[cat]++;
            });
        });
        return {
            masterList, catCounts, comparisons,
            stats: {
                totalCompanies:    companies.length,
                totalCategories:   masterList.length,
                companiesChanged:  comparisons.filter(c => c.changed).length,
                companiesMultiCat: comparisons.filter(c => c.normalised_cats.length > 1).length,
                companiesUnmatched: comparisons.filter(c => c.unmatched_tokens.length > 0).length,
            },
        };
    },

    _unmatchedTokens(raw) {
        if (!raw) return [];
        return raw.split(',').map(t => t.trim()).filter(t => t && !this._matchToken(t));
    },
};
