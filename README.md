# Institutional Multi-Agent Hedge Fund & Tier-1 VC Equity Research System

An institutional-grade equity research operating system modeled after premier global hedge funds (e.g. Tiger Cubs, Point72, Citadel) and Tier-1 venture capital firms (e.g. Sequoia, Founders Fund). 

It implements a rigorous multi-agent DAG architecture that strictly separates raw SEC/market data retrieval from analytical judgment, performs all valuation arithmetic via deterministic code (`pipeline/calculator.mjs`), subjects every investment thesis to an isolated adversarial short-seller attack, conducts forensic accounting audits (Beneish M-Score, Sloan Accrual Anomaly, Stock-Based Compensation economic dilution), enforces a disciplined institutional **"Passing Discipline"**, and compiles publication-grade Word investment memos (`RESEARCH.docx`) and 6-tab financial workbooks (`QUANT_ANALYSIS.xlsx`) directly onto the user's Desktop.

```text
investment-research/
├── SKILL.md                  # Comprehensive skill definition and execution modes
├── README.md                 # System overview and architectural reference
├── contracts/                # 22 Specialist Agent Contracts
│   ├── cio-ic.yaml           # Chief Investment Officer & Investment Committee Chair
│   ├── macro-thematic.yaml   # Macro & Value Chain Thematic Strategist (5 Master Theses)
│   ├── sector-specialist.yaml# Sector Specialists (6 Institutional Coverage Groups)
│   ├── forensic-accounting.yaml # Beneish M-Score, Sloan Accruals, Real SBC Dilution
│   ├── valuation-modeler.yaml# Quant & Deterministic Valuation Modeler
│   ├── bear-adversarial.yaml # Activist Short-Seller Red Team Stress Tester
│   ├── regulatory-geopolitical.yaml # Antitrust, Export Controls & Sovereign Policy
│   ├── risk-officer.yaml     # Downside Floors, Leverage Limits & Position Sizing
│   ├── orchestrator.yaml     # DAG Planner & Gate Routing
│   ├── market-data.yaml      # Live Quotes, Valuation Multiples & Capital Structure
│   ├── filings.yaml          # SEC 10-K, 10-Q, 8-K & Footnote Disclosures
│   ├── news-catalyst.yaml    # Earnings Transcripts & Channel Check Timelines
│   ├── moat-business.yaml    # Porter's Five Forces & ROIC/WACC Spread
│   ├── bull.yaml             # Secular Growth Drivers & Upside Optionality
│   ├── thesis-writer.yaml    # 8-Section Institutional Investment Memo Synthesizer
│   ├── verifier.yaml         # Citation Auditor & Primary Filing Verification (G6)
│   ├── publisher.yaml        # OpenXML DOCX & Multi-Tab XLSX Exporter
│   ├── screener.yaml         # Multi-Ticker Screening & GARP Filters
│   └── monitor.yaml          # Invalidation Trigger & Quarterly Earnings Watch
├── schemas/                  # 22 Validated JSON Schemas
│   ├── ic-verdict.schema.json
│   ├── macro-thematic-assessment.schema.json
│   ├── sector-deep-dive.schema.json
│   ├── forensic-report.schema.json
│   ├── regulatory-geopolitical-assessment.schema.json
│   ├── valuation-model.schema.json
│   ├── thesis-record.schema.json
│   ├── financial-snapshot.schema.json
│   ├── filings-extract.schema.json
│   ├── bear-case.schema.json
│   ├── bull-case.schema.json
│   ├── risk-register.schema.json
│   └── ...
├── pipeline/                 # Execution Pipeline & Engines
│   ├── calculator.mjs        # Zero-dependency deterministic financial calculator
│   ├── exporter.py           # Zero-dependency OpenXML DOCX & 6-Tab XLSX generator
│   ├── dag.yaml              # Multi-agent dependency graph with parallel & isolated groups
│   └── gates.yaml            # Quality Gates G1-G6, IC_VERDICT & HUMAN
├── prompts/                  # Specialist Role Prompts
│   ├── cio-ic.prompt.md
│   ├── macro-thematic.prompt.md
│   ├── sector-specialist.prompt.md
│   ├── forensic-accounting.prompt.md
│   ├── valuation-modeler.prompt.md
│   ├── bear-adversarial.prompt.md
│   ├── regulatory-geopolitical.prompt.md
│   └── risk-officer.prompt.md
├── references/               # Institutional Knowledge Base & Frameworks
│   ├── 5_MACRO_INVESTMENT_THESES.md   # Liquid Cooling, Agentic Rails, Physical AI, Edge AI, Defense
│   ├── PASSING_DISCIPLINE_FRAMEWORK.md # Case studies in saying NO (MU, ISRG, EQIX, BABA, AMBA)
│   ├── FORENSIC_ACCOUNTING_MANUAL.md   # Beneish M-Score, Sloan Accruals, Real SBC Dilution
│   ├── DETERMINISTIC_VALUATION_ENGINE.md # Multi-stage DCF, Reverse DCF solver, SOTP, Sensitivities
│   └── HEDGE_FUND_ORGANIZATIONAL_MANUAL.md # Firm hierarchy, IC voting, Fractional Kelly sizing
├── templates/                # Institutional Deliverable Templates
│   ├── INVESTMENT_MEMO_TEMPLATE.md     # 8-Section Wall Street / Tier-1 VC Memo
│   └── IC_VERDICT_TEMPLATE.md          # Investment Committee Formal Deliberation Record
└── tests/                    # Automated Verification Suite
    ├── test_calculator.mjs   # Node.js tests for DCF, Reverse DCF, SOTP, Beneish, Sloan
    ├── test_exporter.py      # Python tests for OpenXML DOCX and 6-tab XLSX compilation
    └── test_schemas.py       # Python test verifying all 22 JSON schema definitions
```

---

## Core Institutional Architectural Principles

1. **Strict Separation of Retrieval and Judgment**:
   - Data agents (`market-data`, `filings`, `news-catalyst`) retrieve and parse primary sources. They never guess or speculate.
   - Analytical specialists (`forensic-accounting`, `macro-thematic`, `sector-specialist`, `valuation-modeler`, `bear-adversarial`, `risk-officer`, `cio-ic`) interpret existing data. They never browse the live web.
2. **Deterministic Arithmetic in Code (`pipeline/calculator.mjs`)**:
   - Valuation agents author assumptions only. All DCF cash flows, reverse DCF growth rate solvers, SOTP models, Beneish M-Scores, Sloan accrual ratios, Graham numbers, and 2D sensitivity matrices are computed by deterministic code.
   - Gate G3 verifies exact numerical reproducibility.
3. **The 3:1 Asymmetric Reward-to-Risk Hurdle**:
   - Long investments (`APPROVED_LONG`) must demonstrate at least a 3.0x upside to base fair value relative to the stress-tested downside bear floor.
4. **The Strict "Passing Discipline"**:
   - The Investment Committee strictly enforces institutional precedent, rejecting stocks that fail margin of safety hurdles:
     - **Cyclical Commodity Traps (`MU`)**: Peak multiples deceive; heavy capex burdens compress cash flows.
     - **Multiple Derating from Entrant Cannibalization (`ISRG`)**: 40x+ P/E unsustainable as Medtronic Hugo and J&J Ottava break surgical robot monopoly.
     - **Excessive Leverage (`EQIX`)**: Net Debt / EBITDA > 4.0x violates balance sheet risk ceilings.
     - **Structural Price Wars (`BABA`)**: Perpetual valuation compression from domestic market share losses.
     - **Scale Disadvantage (`AMBA`)**: Sub-scale R&D against hyperscale silicon giants.
5. **Adversarial Red Team Isolation**:
   - The Bear agent operates under an activist short-seller mandate (Muddy Waters / Hindenburg mindset), authoring at least 4 falsifiable objections and 2+ numeric kill criteria in strict isolation from the Bull agent.
6. **Exclusive Desktop Workspace**:
   - All research artifacts, financial workbooks, and memos are output directly to `~/Desktop/<TICKER>/`.

---

## Deliverables Generated

For every asset analyzed, the system generates:
- **`~/Desktop/<TICKER>/RESEARCH.docx`**: Full 8-Section Wall Street / Tier-1 VC Institutional Equity Research Memo with professional typography, stylized callouts, and dark navy headers.
- **`~/Desktop/<TICKER>/QUANT_ANALYSIS.xlsx`**: Institutional 6-Tab Financial Workbook:
  - Tab 1: Valuation Summary
  - Tab 2: DCF Projections & Capex Trajectory
  - Tab 3: Reverse DCF & Market Implied Growth
  - Tab 4: 2D Valuation Sensitivity Matrix (WACC vs Terminal Growth)
  - Tab 5: Forensic Accounting & Earnings Quality (Beneish M-Score, Sloan Accruals, SBC Dilution Walk)
  - Tab 6: Relative Multiples & SOTP Valuation
- **`~/Desktop/<TICKER>/RESEARCH.md`**: High-density executive markdown memo.
- **`~/Desktop/<TICKER>/ic-verdict.json`**: Formal Investment Committee deliberation and position sizing mandate.

---

## Automated Verification

Run the test suite to verify code and document generation:
```bash
# Verify financial calculator & valuation engine
node tests/test_calculator.mjs

# Verify OpenXML DOCX and 6-tab XLSX exporter
python3 tests/test_exporter.py

# Verify all 22 JSON schema definitions
python3 tests/test_schemas.py
```

