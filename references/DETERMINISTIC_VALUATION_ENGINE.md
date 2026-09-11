# Deterministic Valuation Engine: Institutional Standards

All financial arithmetic within the investment-research skill is executed via deterministic code (`pipeline/calculator.mjs`) rather than LLM token generation. This guarantees exact reproducibility, auditability, and immunity to hallucination.

---

## 1. Multi-Stage Discounted Cash Flow (DCF)

### Explicit Cash Flows & Capex Cycles
$$\text{PV of Explicit Flows} = \sum_{y=1}^{N} \frac{\text{FCF}_y}{(1 + r)^y}$$
Where:
- $r$ = Weighted Average Cost of Capital (Discount Rate, typically 8.0%–11.0%).
- $N$ = Projection horizon (typically 5 years).
- When a company is in a massive multi-billion Capex ramp (e.g. Amazon AWS custom silicon, Meta AI cluster build, Constellation Crane nuclear refurbishment), $\text{FCF}_y$ MUST be modeled using an explicit trajectory rather than constant compound growth of TTM FCF.

### Terminal Value (Gordon Growth Method)
$$\text{Terminal Value} = \frac{\text{FCF}_N \cdot (1 + g_{\text{term}})}{r - g_{\text{term}}}$$
$$\text{PV of Terminal Value} = \frac{\text{Terminal Value}}{(1 + r)^N}$$
- **Constraint**: $g_{\text{term}} \le 0.030$ (3.0%). Any model with $g_{\text{term}} > 3\%$ fails Gate G3.
- **Terminal Reliance Warning**: If $\frac{\text{PV of Terminal Value}}{\text{Enterprise Value}} > 0.80$, flag that 80%+ of company value depends on assumptions beyond year 5.

### Enterprise Value to Equity Value Bridge
$$\text{Enterprise Value} = \text{PV of Explicit Flows} + \text{PV of Terminal Value}$$
$$\text{Equity Value} = \text{Enterprise Value} + \text{Cash \& Equivalents} - \text{Total Debt}$$
$$\text{Fair Value Per Share} = \frac{\text{Equity Value}}{\text{Diluted Shares Outstanding}}$$

---

## 2. Deterministic Reverse DCF (The Market Expectation Solver)

Rather than asking what a company *should* be worth, the Reverse DCF calculates what cash flow growth rate the market has already baked into the current stock price:

### Problem Formulation
Given:
- Current Market Price $P_0$
- Diluted Shares $S$
- Target Enterprise Value $\text{EV}_{\text{target}} = P_0 \cdot S - \text{Net Cash}$
- Base FCF $FCF_0$, WACC $r$, terminal growth $g_{\text{term}}$, projection years $N$.

Solve for implied growth rate $g_{\text{implied}}$ such that:
$$\sum_{y=1}^{N} \frac{FCF_0 \cdot (1 + g_{\text{implied}})^y}{(1 + r)^y} + \frac{FCF_0 \cdot (1 + g_{\text{implied}})^N \cdot (1 + g_{\text{term}})}{(r - g_{\text{term}}) \cdot (1 + r)^N} = \text{EV}_{\text{target}}$$

### Interpretation
- $g_{\text{implied}} > 25\%$: High bar. The market demands flawless execution; highly vulnerable to any quarterly guidance miss or capex increase.
- $g_{\text{implied}} < 5\%$: Low bar. The market assumes secular stagnation. If the company possesses a durable moat, this represents exceptional asymmetric upside.

---

## 3. Sum-of-the-Parts (SOTP) Valuation

For conglomerates with divergent business models (e.g. Amazon: Retail vs AWS vs Ads; Meta: Social Apps vs Reality Labs; Constellation: Nuclear PPA vs Calpine Merchant Gas):

$$\text{Total Enterprise Value} = \sum_{i=1}^{K} (\text{Segment Metric}_i \times \text{Peer Multiple}_i)$$
$$\text{SOTP Equity Value} = \text{Total Enterprise Value} + \text{Net Cash}$$
$$\text{SOTP Fair Value Per Share} = \frac{\text{SOTP Equity Value}}{\text{Diluted Shares}}$$

---

## 4. 2D Valuation Sensitivity Matrix

Cross-tabulates Discount Rate (WACC: $r_{\text{base}} \pm 2\%$) against Terminal Growth Rate ($g_{\text{term}} \in [1.5\%, 3.0\%]$). Provides investors with an immediate visual grid of fair value sensitivity to interest rate and economic growth environments.
