# Institutional Hedge Fund & Tier-1 VC Organization Manual

This manual details the governance, role hierarchy, isolation barriers, and decision mechanics of the multi-agent investment organization.

---

## 1. Organization Chart & Roster

```text
                               ┌─────────────────────────────────────────┐
                               │   Chief Investment Officer (CIO) / IC   │
                               │        [Investment Verdict & Sizing]    │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 │                                                                     │
   ┌─────────────┴─────────────┐                                         ┌─────────────┴─────────────┐
   │    Investment Committee   │                                         │   Chief Risk Officer (CRO)│
   │  - Conviction Tiering     │                                         │  - Downside Stress Test   │
   │  - Passing Discipline     │                                         │  - Leverage Ceilings      │
   │  - 3:1 Asymmetry Hurdle   │                                         │  - Position Sizing Mandate│
   └─────────────┬─────────────┘                                         └─────────────┬─────────────┘
                 │                                                                     │
                 └──────────────────────────────────┬──────────────────────────────────┘
                                                    │
             ┌──────────────────────────────────────┼──────────────────────────────────────┐
             │                                      │                                      │
┌────────────┴───────────┐             ┌────────────┴───────────┐             ┌────────────┴───────────┐
│ Macro & Theme Analyst  │             │   Sector Specialists   │             │ Forensic Accountant    │
│ - 5 Master Theses      │             │ - 6 Coverage Groups    │             │ - Beneish M-Score      │
│ - Value Chain Bottlenecks            │ - BOM Cost Deflation   │             │ - Sloan Accruals       │
│ - Capex & Power Cycles │             │ - Contract Backlogs    │             │ - SBC Dilution Bridge  │
└────────────────────────┘             └────────────────────────┘             └────────────────────────┘
             │                                      │                                      │
             └──────────────────────────────────────┼──────────────────────────────────────┘
                                                    │
                                       ┌────────────┴───────────┐
                                       │ Quant Valuation Engine │
                                       │ - Explicit DCF Path    │
                                       │ - Reverse DCF Solver   │
                                       │ - SOTP & Sensitivities │
                                       └────────────┬───────────┘
                                                    │
                    ┌───────────────────────────────┴───────────────────────────────┐
                    │                                                               │
     [ISOLATION BARRIER: NO COLLUSION]                               [ISOLATION BARRIER: NO COLLUSION]
                    │                                                               │
       ┌────────────┴───────────┐                                     ┌────────────┴───────────┐
       │   Bull Thesis Analyst  │                                     │  Adversarial Red Team  │
       │ - Secular Tailwinds    │                                     │ - 4+ Falsifiable Flaws │
       │ - Operating Leverage   │                                     │ - 2+ Kill Triggers     │
       │ - Optionality Catalysts│                                     │ - Muddy Waters Mindset │
       └────────────────────────┘                                     └────────────────────────┘
                    │                                                               │
                    └───────────────────────────────┬───────────────────────────────┘
                                                    │
                                       ┌────────────┴───────────┐
                                       │   Fact Verifier (G6)   │
                                       │ - Zero Unsourced Stats │
                                       │ - Primary SEC Filings  │
                                       └────────────┬───────────┘
                                                    │
                                       ┌────────────┴───────────┐
                                       │ Publisher & Exporter   │
                                       │ - RESEARCH.docx (Word) │
                                       │ - QUANT_ANALYSIS.xlsx  │
                                       │ - RESEARCH.md (Memo)   │
                                       └────────────────────────┘
```

---

## 2. The Adversarial Isolation Barrier
- The **Bull** and **Bear** agents operate strictly in parallel under total memory and context isolation.
- The Bull agent never sees the Bear agent's draft before submitting its thesis.
- The Bear agent never sees the Bull agent's draft.
- This prevents the natural human/LLM tendency to soften critiques, seek compromise, or produce wishy-washy consensus.
- The synthesis occurs only at the Investment Committee level, where the CIO weighs the uncompromised bull drivers against the unspared bear attack.

---

## 3. Position Sizing via Fractional Kelly Criterion
For an approved long position:
$$\text{Full Kelly Fraction} f^* = \frac{p \cdot b - q}{b}$$
Where:
- $p$ = Estimated probability of achieving base-case fair value (typically 60%–70% for vetted names).
- $q = 1 - p$ = Probability of downside scenario.
- $b$ = Ratio of upside gain to downside loss: $\frac{\text{Base Fair Value} - P_0}{P_0 - \text{Bear Fair Value}}$.
- **Institutional Practice**: Elite hedge funds never use full Kelly (which causes extreme volatility). The firm uses **Quarter-Kelly ($0.25 \times f^*$)** or **Half-Kelly ($0.50 \times f^*$)**, with an absolute hard portfolio cap of 8.0% for any single equity ticker.
