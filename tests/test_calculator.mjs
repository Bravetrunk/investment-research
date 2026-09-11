import assert from "node:assert";
import { compute, verify, dcf, solveReverseDCF, computeBeneishMScore, computeSloanAccrual, computeSOTP } from "../pipeline/calculator.mjs";

console.log("[*] Testing pipeline/calculator.mjs...");

// 1. Test DCF Trajectory vs Constant Growth
const baseDcf = dcf({
  fcfBase: 5000,
  growth: 0.10,
  discount: 0.09,
  terminalGrowth: 0.025,
  years: 5,
  shares: 1000,
  netCash: 2000,
});

assert(baseDcf.fair_value_per_share > 0, "Fair value should be positive");
assert(baseDcf.equity_value > baseDcf.enterprise_value, "Equity value should include net cash");
assert.strictEqual(baseDcf.flows.length, 5, "Flows length should match projection years");
console.log("  [+] DCF basic computation passed. Fair value per share:", baseDcf.fair_value_per_share);

// 2. Test DCF with Capex cycle explicit trajectory
const trajectoryDcf = dcf({
  fcfBase: 1000, // depressed TTM FCF
  growth: 0.08,
  discount: 0.09,
  terminalGrowth: 0.025,
  years: 5,
  shares: 1000,
  netCash: 0,
  trajectory: [1200, 2500, 4500, 6000, 7500], // recovery after capex cycle
});

assert(trajectoryDcf.fair_value_per_share > baseDcf.fair_value_per_share * 0.5, "Explicit trajectory should discount appropriately");
console.log("  [+] DCF explicit trajectory passed. Fair value per share:", trajectoryDcf.fair_value_per_share);

// 3. Test Reverse DCF Solver
const revDcf = solveReverseDCF({
  currentPrice: 100,
  shares: 1000,
  fcfBase: 4000,
  discountRate: 0.09,
  terminalGrowthRate: 0.025,
  years: 5,
  netCash: 0,
});

assert(revDcf !== null, "Reverse DCF should produce a result");
assert(typeof revDcf.implied_fcf_growth_rate === "number", "Implied growth rate must be a number");
console.log("  [+] Reverse DCF solver passed. Implied growth rate:", revDcf.implied_growth_pct);

// 4. Test SOTP Module
const sotp = computeSOTP(
  {
    segments: [
      { name: "Cloud / AWS", metric_type: "revenue", metric_value: 120000, multiple: 8.0, benchmark_peer: "MSFT Cloud" },
      { name: "Retail / E-Commerce", metric_type: "revenue", metric_value: 450000, multiple: 1.5, benchmark_peer: "WMT / COST" },
      { name: "Digital Advertising", metric_type: "ebitda", metric_value: 30000, multiple: 15.0, benchmark_peer: "META / GOOGL" },
    ],
  },
  10500,
  15000
);

assert(sotp !== null, "SOTP should produce a result");
assert(sotp.total_enterprise_value > 1000000, "Enterprise value should sum segment EVs");
assert(sotp.fair_value_per_share > 0, "Fair value per share should be positive");
console.log("  [+] SOTP module passed. SOTP Fair Value per Share:", sotp.fair_value_per_share);

// 5. Test Forensic Accounting: Beneish M-Score
const cleanBeneish = computeBeneishMScore({
  dsri: 1.02,
  gmi: 0.98,
  aqi: 1.01,
  sgi: 1.12,
  depi: 1.00,
  sgai: 0.95,
  tata: -0.02,
  lvgi: 0.99,
});
assert.strictEqual(cleanBeneish.is_manipulator_probability_high, false, "Clean inputs should not trigger manipulator flag");

const badBeneish = computeBeneishMScore({
  dsri: 2.8,
  gmi: 2.1,
  aqi: 2.5,
  sgi: 2.3,
  depi: 0.4,
  sgai: 1.8,
  tata: 0.25,
  lvgi: 1.9,
});
assert.strictEqual(badBeneish.is_manipulator_probability_high, true, "Distorted inputs should trigger manipulator flag");
console.log("  [+] Beneish M-Score passed. Clean:", cleanBeneish.m_score, "| Manipulator alert:", badBeneish.m_score);

// 6. Test Sloan Accrual
const sloanNormal = computeSloanAccrual(1000, 1200, 10000);
assert(sloanNormal.quality_band.includes("NORMAL") || sloanNormal.quality_band.includes("CONSERVATIVE"));
console.log("  [+] Sloan Accrual passed. Accrual Ratio:", sloanNormal.accrual_pct);

// 7. Test Fractional Kelly Sizing
import { computeKellySizing } from "../pipeline/calculator.mjs";
const kellyGood = computeKellySizing({ upsidePct: 60, downsidePct: 15, probWin: 0.65, fraction: "half" });
assert(kellyGood.recommended_position_pct.endsWith("%"), "Kelly position size must be formatted as percentage");
assert(parseFloat(kellyGood.recommended_position_pct) > 0, "Favorable asymmetric bet should yield positive allocation");
console.log("  [+] Fractional Kelly sizing passed. Good asymmetry allocation:", kellyGood.recommended_position_pct);

const kellyBad = computeKellySizing({ upsidePct: 5, downsidePct: 45, probWin: 0.50, fraction: "half" });
assert.strictEqual(kellyBad.recommended_position_pct, "0%", "Negative expected payoff must yield 0% allocation");
console.log("  [+] Fractional Kelly rejection passed. Low asymmetry allocation:", kellyBad.recommended_position_pct);

// 8. Test Reverse DCF with Negative FCF Base (Edge Case)
const revDcfNegative = solveReverseDCF({
  currentPrice: 50,
  shares: 100,
  fcfBase: -200,
  discountRate: 0.10,
  terminalGrowthRate: 0.025,
});
assert.strictEqual(revDcfNegative.implied_fcf_growth_rate, null, "Implied growth should be null for negative FCF base");
assert(revDcfNegative.interpretation.includes("inapplicable"), "Must explain why constant reverse DCF is inapplicable");
console.log("  [+] Reverse DCF negative FCF edge case passed.");

// 8b. Test Reverse DCF with Discount Rate <= Terminal Growth (Edge Case)
const revDcfInvalidRate = solveReverseDCF({
  currentPrice: 100,
  shares: 10,
  fcfBase: 50,
  discountRate: 0.02,
  terminalGrowthRate: 0.025,
});
assert(revDcfInvalidRate !== null, "Should return an informative object, not null or crash");
assert.strictEqual(revDcfInvalidRate.implied_fcf_growth_rate, null, "Implied growth must be null when discount rate <= terminal growth rate");
assert(revDcfInvalidRate.interpretation.includes("strictly exceed"), "Must explain discount rate vs terminal growth rate convergence requirement");
console.log("  [+] Reverse DCF discount <= terminal growth edge case passed.");

// 8c. Test compute() validation error handling
assert.throws(() => compute(null), /Invalid valuation model/, "compute(null) must throw descriptive validation error");
assert.throws(() => compute({}), /Invalid valuation model/, "compute({}) must throw descriptive validation error");
console.log("  [+] compute() input validation error handling passed.");

// 9. Full Model with Trajectory and Sensitivity Matrix Alignment
const sampleModel = {
  ticker: "CEG",
  computed_by: "calculator",
  inputs: {
    current_price: 294.3,
    eps_used: 12.0,
    eps_basis: "adjusted",
    fcf_base: 3800.0,
    shares_diluted: 356.5,
    book_value_per_share: 89.7,
    net_cash: -15841.0,
  },
  dcf: {
    projection_years: 5,
    terminal_growth_rate: 0.025,
    cases: [
      { case: "low", fcf_growth_rate: 0.06, fcf_trajectory: [3200, 3500, 4200, 4600, 4900], discount_rate: 0.085, rationale: "Conservative power prices" },
      { case: "base", fcf_growth_rate: 0.12, fcf_trajectory: [4000, 4400, 5600, 6400, 7200], discount_rate: 0.075, rationale: "Crane restart online" },
      { case: "high", fcf_growth_rate: 0.16, fcf_trajectory: [4300, 5000, 6500, 7800, 8900], discount_rate: 0.070, rationale: "Tech PPAs expand" },
    ],
  },
  graham: { applicability: "meaningful" },
  relative: { multiples: [] },
};

const computed = compute(sampleModel);
assert(computed.computed_by === "calculator");
assert(computed.fair_value_range.base > 0);
assert(computed.reverse_dcf !== null);
assert(computed.sensitivity_matrix.matrix.length === 5);

// Verify exact sensitivity matrix alignment with base DCF fair value:
const baseDrRow = computed.sensitivity_matrix.matrix.find((r) => r.discount_rate === 0.075);
assert(baseDrRow, "Base discount rate row must exist in sensitivity matrix");
const matrixBaseVal = baseDrRow.columns["2.5%"];
assert.strictEqual(matrixBaseVal, computed.fair_value_range.base, "Sensitivity matrix cell at base WACC and TG must match base fair value exactly");
console.log("  [+] Sensitivity matrix exact alignment verified:", matrixBaseVal, "==", computed.fair_value_range.base);

sampleModel.dcf.cases.forEach((c) => {
  c.fair_value_per_share = computed.cases[c.case].fair_value_per_share;
});

const verifyResult = verify(sampleModel);
assert.strictEqual(verifyResult.verdict, "pass", "Verify should pass when values match computed output");
console.log("  [+] Full model compute and Gate G3 verify passed successfully!");

console.log("[✓] ALL CALCULATOR TESTS PASSED!");
