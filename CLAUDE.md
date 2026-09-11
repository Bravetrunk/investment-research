# Claude Code Guidelines: Institutional Equity Research (`investment-research`)

Welcome to the **Institutional Multi-Agent Hedge Fund & Tier-1 VC Equity Research System**.

This repository operates like an elite investment organization (Tiger Cubs, Point72, Citadel, Sequoia, Founders Fund). When assisting the user in investment research, follow these strict institutional rules.

---

## 1. Core Operating Principles

1. **Deterministic Arithmetic Only**:
   - **NEVER** calculate multi-stage DCF, Reverse DCF implied growth rates, SOTP, Graham numbers, or sensitivity matrices inside LLM tokens.
   - Always run the deterministic calculator:
     ```bash
     investment-research-calc <model.json> --write
     # Or via unified CLI:
     investment-research calc <model.json> --write
     ```
2. **Desktop Workspace Isolation**:
   - All equity research workspaces live exclusively in `~/Desktop/<TICKER>/` (e.g. `~/Desktop/CEG/`, `~/Desktop/NVDA/`).
   - Scaffolding a new workspace:
     ```bash
     investment-research init <TICKER>
     ```
3. **The 3:1 Asymmetric Reward-to-Risk Hurdle**:
   - Long investment mandates (`APPROVED_LONG`) must demonstrate $\ge 3.0x$ base upside relative to stress-tested downside bear floor.
4. **The Institutional Passing Discipline**:
   - Enforce rigorous discipline in saying **NO** to hot stocks:
     - *Cyclical Commodity Traps* (e.g. `MU`): High capex, peak multiple illusions.
     - *Multiple Derating & Cannibalization* (e.g. `ISRG`): 40x+ P/E under threat from well-funded rivals.
     - *Excessive Leverage* (e.g. `EQIX`): Net Debt / EBITDA > 4.0x ceiling.
     - *Structural Price Wars* (e.g. `BABA`): Multiple compression.
     - *Scale Disadvantages* (e.g. `AMBA`): Sub-scale R&D.
5. **Adversarial Red Team Short-Seller Attack**:
   - Every thesis must withstand an activist short-seller assault formulating at least 4 falsifiable objections and 2+ numeric kill criteria.

---

## 2. Fast Commands for Claude Code

### Deterministic Financial Modeling
```bash
# Compute and print valuation metrics
investment-research-calc ~/Desktop/<TICKER>/valuation-model.json

# Compute and persist results into model file
investment-research-calc ~/Desktop/<TICKER>/valuation-model.json --write

# Verify Gate G3 numerical reproducibility
investment-research-calc ~/Desktop/<TICKER>/valuation-model.json --verify
```

### Institutional Artifact Exporters
```bash
# Compile publication Word memo (RESEARCH.docx) & 6-tab Excel (QUANT_ANALYSIS.xlsx)
investment-research export <TICKER>

# Compare multiple screening candidates
investment-research screen CEG VST CCJ --out ~/Desktop/Power_Screen
```

### Workspace Auditing & Quality Gates
```bash
# Check status of all artifacts and gate completions
investment-research status <TICKER>
```

---

## 3. Model Context Protocol (MCP) Setup

Connect `investment-research` as a native MCP server in Claude Code:
```bash
claude mcp add investment-research -- npx -y -p github:Bravetrunk/investment-research investment-research-mcp
```
Once connected, Claude Code can invoke:
- `calculate_valuation`
- `solve_reverse_dcf`
- `calculate_sotp`
- `calculate_forensic_accounting`
- `evaluate_passing_discipline`
- `export_research_artifacts`
- `init_workspace`
- `verify_valuation_model`

---

## 4. Slash Commands (`/goal` & `/boost`)

When the user enters slash commands:
- `/goal <ticker or objective>`: Set the research objective, asset target, valuation methodology, and risk constraints.
- `/boost <ticker or command>`: Activate full autonomous multi-agent deep research mode, orchestrating parallel data retrieval, deterministic calculation, adversarial red team attack, and publication export.
