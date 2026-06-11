// ═══════════════════════════════════════════════════════════════
//  demo-data.js — Sample companies used when USE_GOOGLE_SHEETS
//  is false. Replace with your real data via Google Sheets.
// ═══════════════════════════════════════════════════════════════

const DEMO_DATA = {

    // ── COMPANIES ─────────────────────────────────────────────
    // Each row = one company.
    // Column names must exactly match the headers in your
    // Google Sheet "Companies" tab.
    companies: [
        {
            company_id:                   '001',
            company_name:                 'TechVision Solutions',
            registration_number:          'TH-0105563012345',
            website:                      'https://techvision.example.com',
            contact_person:               'Somchai Jaidee',
            contact_phone:                '+66 2 123 4567',
            contact_email:                'somchai@techvision.example.com',
            registered_capital:           '50,000,000',
            business_type:                'Technology',
            description:                  'Leading provider of enterprise software solutions and digital transformation services for mid-to-large Thai corporations.',
            key_strengths:                'Strong R&D team, Established client base of 200+ enterprises, ISO 27001 certified, Award-winning UX',
            products:                     'ERP Systems, Cloud Migration Services, Data Analytics Platform, Custom Software Development',
            future_plans:                 'Expand to Southeast Asia by 2026, Launch AI-powered predictive analytics module, IPO preparation',
            collaboration_opportunities:  'Joint product development, Technology licensing, White-label SaaS, System integration',
            strategic_alignment:          'Very high alignment with digital transformation and data-driven decision strategy',
            partnership_score:            8.5,
            strategic_fit_score:          9.0
        },
        {
            company_id:                   '002',
            company_name:                 'GreenEnergy Corporation',
            registration_number:          'TH-0105560023456',
            website:                      'https://greenenergy.example.com',
            contact_person:               'Pranee Sangthong',
            contact_phone:                '+66 2 234 5678',
            contact_email:                'pranee@greenenergy.example.com',
            registered_capital:           '120,000,000',
            business_type:                'Energy',
            description:                  'Renewable energy company specialising in solar and wind power installations for industrial and commercial clients across Thailand.',
            key_strengths:                'Government-approved contractor, 1,200 MW installed capacity, Certified engineering team of 150, BOI privileges',
            products:                     'Solar Farm Installation, Wind Power Systems, Energy Storage Solutions, Green Energy Consulting',
            future_plans:                 'Launch 500MW solar project in 2025, Enter Vietnam market, Green bond issuance',
            collaboration_opportunities:  'Project financing partnership, Technology procurement, Joint venture development, ESG co-reporting',
            strategic_alignment:          'Strong alignment with ESG commitments and sustainability targets',
            partnership_score:            7.8,
            strategic_fit_score:          8.2
        },
        {
            company_id:                   '003',
            company_name:                 'MediCare Systems',
            registration_number:          'TH-0105590034567',
            website:                      'https://medicare.example.com',
            contact_person:               'Dr. Wanchai Boonrod',
            contact_phone:                '+66 2 345 6789',
            contact_email:                'wanchai@medicare.example.com',
            registered_capital:           '80,000,000',
            business_type:                'Healthcare',
            description:                  'Healthcare technology company providing hospital management systems and telemedicine platforms to 50+ hospitals nationwide.',
            key_strengths:                'FDA Class II device approval, 50 hospital clients, Robust clinical data security, HIMSS Stage 6 certified',
            products:                     'Hospital Management System, Telemedicine Platform, Medical IoT Devices, AI Diagnostic Tools',
            future_plans:                 'Expand telemedicine to rural areas, Launch AI diagnostic tool in Q3 2025, Partner with insurance providers',
            collaboration_opportunities:  'Healthcare data analytics, System integration, Research & clinical trial partnership, Insurance tech',
            strategic_alignment:          'Moderate alignment with healthcare sector and wellness initiatives',
            partnership_score:            6.5,
            strategic_fit_score:          7.0
        },
        {
            company_id:                   '004',
            company_name:                 'LogiTrans Network',
            registration_number:          'TH-0105610045678',
            website:                      'https://logitrans.example.com',
            contact_person:               'Krisana Pimpa',
            contact_phone:                '+66 2 456 7890',
            contact_email:                'krisana@logitrans.example.com',
            registered_capital:           '35,000,000',
            business_type:                'Logistics',
            description:                  'End-to-end logistics and supply chain management company with nationwide coverage and real-time tracking technology.',
            key_strengths:                '77-province nationwide network, Real-time GPS tracking, 24/7 operations, Cold chain certified',
            products:                     'Last-mile Delivery, Warehouse Management, Cold Chain Logistics, Fleet Telematics SaaS',
            future_plans:                 'Drone delivery pilot in 2025, Expand to 5 ASEAN countries, Launch logistics-as-a-service API',
            collaboration_opportunities:  'Distribution network access, Shared warehousing, Technology API integration, Co-branded services',
            strategic_alignment:          'High alignment with supply chain optimisation and operational efficiency strategy',
            partnership_score:            9.2,
            strategic_fit_score:          8.8
        },
        {
            company_id:                   '005',
            company_name:                 'FinTech Innovations',
            registration_number:          'TH-0105620056789',
            website:                      'https://fintechinno.example.com',
            contact_person:               'Apinya Tanawat',
            contact_phone:                '+66 2 567 8901',
            contact_email:                'apinya@fintechinno.example.com',
            registered_capital:           '200,000,000',
            business_type:                'Financial Services',
            description:                  'Digital payment and financial services platform serving 2.4 million registered users with a full suite of fintech products.',
            key_strengths:                '2.4M active users, Bank of Thailand licensed, PCI DSS Level 1 certified, Series B funded at $45M',
            products:                     'Digital Wallet, Payment Gateway, Micro-lending Platform, Merchant POS System',
            future_plans:                 'Launch investment products Q1 2025, Expand to Cambodia and Myanmar, B2B payment infrastructure licensing',
            collaboration_opportunities:  'Payment gateway integration, Financial data sharing, Co-marketing campaigns, B2B lending product',
            strategic_alignment:          'Very high alignment with digital economy and cashless society strategy',
            partnership_score:            9.5,
            strategic_fit_score:          9.3
        }
    ],

    // ── FINANCIALS ────────────────────────────────────────────
    // Each row = one year of financial data for one company.
    // company_id must match the Companies tab.
    // revenue and net_profit are in full units (e.g. Thai Baht).
    financials: [
        // TechVision Solutions
        { company_id: '001', year: 2020, revenue:  45000000, net_profit:  6750000 },
        { company_id: '001', year: 2021, revenue:  58000000, net_profit:  9280000 },
        { company_id: '001', year: 2022, revenue:  72000000, net_profit: 12240000 },
        { company_id: '001', year: 2023, revenue:  89000000, net_profit: 15130000 },
        { company_id: '001', year: 2024, revenue: 115000000, net_profit: 20700000 },

        // GreenEnergy Corporation
        { company_id: '002', year: 2020, revenue: 180000000, net_profit: 27000000 },
        { company_id: '002', year: 2021, revenue: 195000000, net_profit: 29250000 },
        { company_id: '002', year: 2022, revenue: 220000000, net_profit: 35200000 },
        { company_id: '002', year: 2023, revenue: 265000000, net_profit: 42400000 },
        { company_id: '002', year: 2024, revenue: 310000000, net_profit: 55800000 },

        // MediCare Systems
        { company_id: '003', year: 2020, revenue:  95000000, net_profit:  9500000 },
        { company_id: '003', year: 2021, revenue: 102000000, net_profit: 10200000 },
        { company_id: '003', year: 2022, revenue: 118000000, net_profit: 14160000 },
        { company_id: '003', year: 2023, revenue: 125000000, net_profit: 15000000 },
        { company_id: '003', year: 2024, revenue: 140000000, net_profit: 18200000 },

        // LogiTrans Network
        { company_id: '004', year: 2020, revenue:  62000000, net_profit:  7440000 },
        { company_id: '004', year: 2021, revenue:  78000000, net_profit:  9360000 },
        { company_id: '004', year: 2022, revenue:  95000000, net_profit: 13300000 },
        { company_id: '004', year: 2023, revenue: 118000000, net_profit: 16520000 },
        { company_id: '004', year: 2024, revenue: 145000000, net_profit: 21750000 },

        // FinTech Innovations
        { company_id: '005', year: 2020, revenue: 320000000, net_profit:  32000000 },
        { company_id: '005', year: 2021, revenue: 415000000, net_profit:  49800000 },
        { company_id: '005', year: 2022, revenue: 520000000, net_profit:  72800000 },
        { company_id: '005', year: 2023, revenue: 680000000, net_profit: 102000000 },
        { company_id: '005', year: 2024, revenue: 850000000, net_profit: 136000000 },
    ]
};
