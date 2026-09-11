# Forensic Accounting & Earnings Quality Manual

Institutional reference for detecting financial engineering, non-cash accrual inflation, and hidden economic dilution.

---

## 1. The Beneish M-Score (8-Factor Model)

The Beneish M-Score is an empirical mathematical model created by Professor Messod Beneish to calculate the probability that a public company has manipulated its earnings.

### Formula
$$M = -4.84 + 0.920 \cdot \text{DSRI} + 0.528 \cdot \text{GMI} + 0.404 \cdot \text{AQI} + 0.892 \cdot \text{SGI} + 0.115 \cdot \text{DEPI} - 0.172 \cdot \text{SGAI} + 4.037 \cdot \text{TATA} + 0.0327 \cdot \text{LVGI}$$

### Decision Boundary
- **$M > -1.78$**: **HIGH RISK OF MANIPULATION** (Manipulator Alert).
- **$M \le -1.78$**: **LOW PROBABILITY OF MANIPULATION** (Non-Manipulator / Clean).

### Sub-Index Formulas & Red Flags
1. **DSRI (Days Sales in Receivables Index)**:
   $$\text{DSRI} = \frac{\text{Receivables}_t / \text{Sales}_t}{\text{Receivables}_{t-1} / \text{Sales}_{t-1}}$$
   *Red Flag*: DSRI > 1.30 indicates receivables are growing disproportionately to revenues. Common signal of channel stuffing, unbilled revenue booking, or lenient customer credit terms to pull forward sales.
2. **GMI (Gross Margin Index)**:
   $$\text{GMI} = \frac{\text{Gross Margin}_{t-1} / \text{Sales}_{t-1}}{\text{Gross Margin}_t / \text{Sales}_t}$$
   *Red Flag*: GMI > 1.00 indicates gross margin deterioration, putting management under pressure to engage in accounting maneuvers.
3. **AQI (Asset Quality Index)**:
   $$\text{AQI} = \frac{1 - (\text{Current Assets}_t + \text{PP\&E}_t + \text{Securities}_t) / \text{Total Assets}_t}{1 - (\text{Current Assets}_{t-1} + \text{PP\&E}_{t-1} + \text{Securities}_{t-1}) / \text{Total Assets}_{t-1}}$$
   *Red Flag*: AQI > 1.20 indicates that operating expenses are being capitalized into intangible or "other" assets rather than expensed through the income statement.
4. **SGI (Sales Growth Index)**:
   $$\text{SGI} = \frac{\text{Sales}_t}{\text{Sales}_{t-1}}$$
   *Red Flag*: High growth creates strong incentive to preserve high market multiples.
5. **DEPI (Depreciation Index)**:
   $$\text{DEPI} = \frac{\text{Depr Rate}_{t-1}}{\text{Depr Rate}_t} \quad \text{where} \quad \text{Depr Rate} = \frac{\text{Depreciation}}{\text{PP\&E} + \text{Depreciation}}$$
   *Red Flag*: DEPI > 1.05 indicates slowing depreciation rate, often caused by extending asset useful lives to artificially inflate accounting earnings.
6. **SGAI (Sales, General and Administrative Expenses Index)**:
   $$\text{SGAI} = \frac{\text{SG\&A}_t / \text{Sales}_t}{\text{SG\&A}_{t-1} / \text{Sales}_{t-1}}$$
   *Red Flag*: Decreasing operational leverage.
7. **LVGI (Leverage Index)**:
   $$\text{LVGI} = \frac{\text{Total Debt}_t / \text{Total Assets}_t}{\text{Total Debt}_{t-1} / \text{Total Assets}_{t-1}}$$
   *Red Flag*: Expanding leverage increases loan covenant pressure.
8. **TATA (Total Accruals to Total Assets)**:
   $$\text{TATA} = \frac{\text{Operating Income}_t - \text{Cash Flow from Operations}_t}{\text{Total Assets}_t}$$
   *Red Flag*: Positive, large TATA indicates that reported operating profits have no backing in actual operational cash collections.

---

## 2. The Sloan Accrual Anomaly

Pioneered by Richard Sloan (1996), this metric measures the divergence between accounting net income and true cash generation:

$$\text{Sloan Accrual Ratio} = \frac{\text{Net Income} - \text{Cash Flow from Operations}}{\text{Average Total Assets}}$$

### Interpretation
- **Accrual Ratio > +10.0%**: High non-cash accrual contamination. Historically leads to earnings revisions and stock underperformance over a 12–24 month horizon.
- **Accrual Ratio < -10.0%**: Exceptionally high cash flow conversion. The company is generating far more cash than reported net income.
- **-10.0% to +10.0%**: Healthy operating equilibrium.

---

## 3. Stock-Based Compensation (SBC) Real Economic Dilution Bridge

Wall Street equity analysts frequently add back Stock-Based Compensation to Non-GAAP EPS and FCF, treating employee equity grants as "non-cash expenses."

### The Institutional Reality
Employee options and RSUs represent **real economic compensation expense paid with corporate equity rather than cash dollars**. If a company stopped issuing stock, it would have to pay cash bonuses to retain engineers and executives.

### Audit Formulas
1. **SBC Cash Burden**:
   $$\text{SBC Burden} = \frac{\text{Stock-Based Compensation}}{\text{Reported Operating Cash Flow}}$$
   - If SBC Burden > 25%, reported operating leverage is illusory.
2. **Economic EPS Bridge**:
   $$\text{Adjusted Economic EPS} = \text{Reported Non-GAAP EPS} - \frac{\text{SBC Expense}}{\text{Diluted Share Count}}$$
3. **True Free Cash Flow**:
   $$\text{True Economic FCF} = \text{Reported FCF} - \text{Stock-Based Compensation}$$
   *(or modeled with explicit share count dilution expanding by the annual grant burn rate).*
