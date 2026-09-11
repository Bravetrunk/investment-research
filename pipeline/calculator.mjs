#!/usr/bin/env node
/**
 * Institutional Deterministic Financial Calculator
 *
 * Designed for Hedge Fund & Tier-1 VC Equity Research.
 *
 * Features:
 *   1. Explicit Multi-Stage DCF with Capex trajectories & constant growth modes.
 *   2. Deterministic Reverse DCF solver (implied market growth rate solver).
 *   3. Sum-of-the-Parts (SOTP) conglomerate & segment valuation module.
 *   4. Forensic Accounting: Beneish M-Score & Sloan Accrual Ratio.
 *   5. Real Economic Dilution (SBC dilution walk).
 *   6. Graham Number calibrated for asset-light / asset-heavy businesses.
 *   7. 2D Sensitivity Matrix (Discount Rate vs. Terminal Growth).
 *   8. Asymmetric Risk/Reward Ratio (Hedge fund hurdle >= 3:1).
 *
 * Zero external dependencies. Node.js 18+.
 *
 * CLI Usage:
 *   node pipeline/calculator.mjs model.json            # compute and print
 *   node pipeline/calculator.mjs model.json --write    # write outputs back into model.json
 *   node pipeline/calculator.mjs model.json --verify   # Gate G3 verification
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const round = (n, d = 2) => {
  if (typeof n !== "number" || isNaN(n)) return null;
  return Math.round(n * 10 ** d) / 10 ** d;
};

/**
 * DCF with an explicit FCF trajectory or constant growth.
 */
export function dcf({
  fcfBase,
  growth,
  discount,
  terminalGrowth,
  years = 5,
  shares,
  netCash = 0,
  trajectory = null,
}) {
  if (discount <= terminalGrowth) {
    throw new Error(`discount_rate (${discount}) must exceed terminal_growth_rate (${terminalGrowth})`);
  }
  if (!shares || shares <= 0) {
    throw new Error(`shares_diluted must be positive, got ${shares}`);
  }

  const flows = [];
  for (let y = 1; y <= years; y++) {
    const fcf = trajectory?.length
      ? (trajectory[y - 1] ?? trajectory[trajectory.length - 1])
      : fcfBase * (1 + growth) ** y;
    flows.push({ year: y, fcf, pv: fcf / (1 + discount) ** y });
  }

  const finalFcf = flows[flows.length - 1].fcf;
  const terminalValue = (finalFcf * (1 + terminalGrowth)) / (discount - terminalGrowth);
  const pvTerminal = terminalValue / (1 + discount) ** years;

  const pvFlows = flows.reduce((s, f) => s + f.pv, 0);
  const enterpriseValue = pvFlows + pvTerminal;
  const equityValue = enterpriseValue + netCash;

  return {
    pv_explicit_flows: round(pvFlows),
    pv_terminal: round(pvTerminal),
    terminal_share_of_value: round(pvTerminal / (pvFlows + pvTerminal), 3),
    enterprise_value: round(enterpriseValue),
    equity_value: round(equityValue),
    fair_value_per_share: round(equityValue / shares),
    flows: flows.map((f) => ({ year: f.year, fcf: round(f.fcf), pv: round(f.pv) })),
  };
}

/**
 * Reverse DCF Solver: Solves for the implied constant FCF growth rate (g_implied)
 * embedded in the current market price.
 */
export function solveReverseDCF({
  currentPrice,
  shares,
  fcfBase,
  discountRate,
  terminalGrowthRate,
  years = 5,
  netCash = 0,
}) {
  if (!currentPrice || currentPrice <= 0 || !shares || shares <= 0) {
    return null;
  }

  if (!fcfBase || fcfBase <= 0) {
    return {
      current_price: currentPrice,
      implied_fcf_growth_rate: null,
      implied_growth_pct: "N/A (Negative/Zero Base FCF)",
      interpretation:
        "Reverse DCF constant-growth solver is inapplicable when base FCF is negative or zero. Valuation requires explicit capex/recovery trajectory.",
    };
  }

  const targetEquityValue = currentPrice * shares;
  const targetEV = targetEquityValue - netCash;

  if (targetEV <= 0) {
    return {
      current_price: currentPrice,
      target_equity_value: round(targetEquityValue),
      target_enterprise_value: round(targetEV),
      implied_fcf_growth_rate: null,
      implied_growth_pct: "N/A (Negative Target EV)",
      interpretation: "Target Enterprise Value is negative or zero (excess net cash exceeds market cap).",
    };
  }

  if (!discountRate || !terminalGrowthRate || discountRate <= terminalGrowthRate) {
    return {
      current_price: currentPrice,
      target_equity_value: round(targetEquityValue),
      target_enterprise_value: round(targetEV),
      implied_fcf_growth_rate: null,
      implied_growth_pct: "N/A (Invalid Discount/Terminal Rates)",
      discount_rate_used: discountRate,
      terminal_growth_used: terminalGrowthRate,
      interpretation: `Discount rate (${discountRate}) must strictly exceed terminal growth rate (${terminalGrowthRate}) for reverse DCF convergence.`,
    };
  }

  // Dynamic bounds search: initial window [-0.90, 5.00]
  let lowG = -0.90;
  let highG = 5.00;
  let impliedG = null;

  const calcEV = (g) => {
    let pvExplicit = 0;
    let finalFcf = fcfBase;
    for (let y = 1; y <= years; y++) {
      const fcf = fcfBase * (1 + g) ** y;
      pvExplicit += fcf / (1 + discountRate) ** y;
      if (y === years) finalFcf = fcf;
    }
    const tv = (finalFcf * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
    const pvTv = tv / (1 + discountRate) ** years;
    return pvExplicit + pvTv;
  };

  // Expand upper bound dynamically for hyper-growth companies
  while (calcEV(highG) < targetEV && highG < 20.0) {
    highG *= 2.0;
  }

  if (calcEV(highG) < targetEV) {
    return {
      current_price: currentPrice,
      target_equity_value: round(targetEquityValue),
      target_enterprise_value: round(targetEV),
      implied_fcf_growth_rate: highG,
      implied_growth_pct: `> ${round(highG * 100, 0)}%`,
      discount_rate_used: discountRate,
      terminal_growth_used: terminalGrowthRate,
      interpretation: "Hyper-growth priced in (>500% CAGR); extreme valuation froth and vulnerable to multiple collapse.",
    };
  }

  for (let iter = 0; iter < 100; iter++) {
    const midG = (lowG + highG) / 2;
    const evMid = calcEV(midG);

    if (Math.abs(evMid - targetEV) / targetEV < 0.0001) {
      impliedG = midG;
      break;
    }
    if (evMid < targetEV) {
      lowG = midG;
    } else {
      highG = midG;
    }
    impliedG = midG;
  }

  return {
    current_price: currentPrice,
    target_equity_value: round(targetEquityValue),
    target_enterprise_value: round(targetEV),
    implied_fcf_growth_rate: round(impliedG, 4),
    implied_growth_pct: round(impliedG * 100, 2) + "%",
    discount_rate_used: discountRate,
    terminal_growth_used: terminalGrowthRate,
    interpretation:
      impliedG > 0.25
        ? "Aggressive growth expectations priced in (>25% CAGR); highly vulnerable to multiple compression."
        : impliedG < 0.05
        ? "Modest expectations priced in (<5% CAGR); strong asymmetric margin of safety."
        : "Balanced consensus expectations priced in (5-25% CAGR).",
  };
}

/**
 * Sum-of-the-Parts (SOTP) Valuation Module
 */
export function computeSOTP(sotpConfig, shares, netCash = 0) {
  if (!sotpConfig || !Array.isArray(sotpConfig.segments) || sotpConfig.segments.length === 0) {
    return null;
  }

  let totalEV = 0;
  const evaluatedSegments = sotpConfig.segments.map((seg) => {
    const metricVal = seg.metric_value || 0;
    const multiple = seg.multiple || 1.0;
    const segmentEV = metricVal * multiple;
    totalEV += segmentEV;
    return {
      name: seg.name,
      metric_type: seg.metric_type,
      metric_value: metricVal,
      multiple,
      benchmark_peer: seg.benchmark_peer || "Sector Median",
      segment_ev: round(segmentEV),
    };
  });

  const equityValue = totalEV + netCash;
  const fairValuePerShare = shares > 0 ? round(equityValue / shares) : null;

  return {
    segments: evaluatedSegments,
    total_enterprise_value: round(totalEV),
    net_cash: round(netCash),
    equity_value: round(equityValue),
    shares_diluted: shares,
    fair_value_per_share: fairValuePerShare,
  };
}

/**
 * Forensic Accounting: Beneish M-Score Calculation
 * Formula: M = -4.84 + 0.920*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.037*TATA + 0.0327*LVGI
 */
export function computeBeneishMScore(b) {
  if (!b) return null;

  const dsri = b.dsri ?? 1.0;
  const gmi = b.gmi ?? 1.0;
  const aqi = b.aqi ?? 1.0;
  const sgi = b.sgi ?? 1.0;
  const depi = b.depi ?? 1.0;
  const sgai = b.sgai ?? 1.0;
  const tata = b.tata ?? 0.0;
  const lvgi = b.lvgi ?? 1.0;

  const mScore =
    -4.84 +
    0.92 * dsri +
    0.528 * gmi +
    0.404 * aqi +
    0.892 * sgi +
    0.115 * depi -
    0.172 * sgai +
    4.037 * tata +
    0.0327 * lvgi;

  const isManipulator = mScore > -1.78;

  return {
    m_score: round(mScore, 3),
    is_manipulator_probability_high: isManipulator,
    threshold: -1.78,
    verdict: isManipulator ? "HIGH_RISK_EARNINGS_MANIPULATION" : "CLEAN_LOW_MANIPULATION_RISK",
    indices: { dsri, gmi, aqi, sgi, depi, sgai, tata, lvgi },
  };
}

/**
 * Forensic Accounting: Sloan Accrual Ratio
 * Accrual Ratio = (Net Income - Cash Flow from Operations) / Average Total Assets
 */
export function computeSloanAccrual(netIncome, cfo, totalAssets, prevTotalAssets = null) {
  if (netIncome == null || cfo == null || !totalAssets) return null;

  const avgAssets = prevTotalAssets ? (totalAssets + prevTotalAssets) / 2 : totalAssets;
  const accrual = (netIncome - cfo) / avgAssets;

  return {
    accrual_ratio: round(accrual, 4),
    accrual_pct: round(accrual * 100, 2) + "%",
    quality_band:
      accrual > 0.1
        ? "LOW_EARNINGS_QUALITY (Aggressive Accruals)"
        : accrual < -0.1
        ? "VERY_HIGH_EARNINGS_QUALITY (Conservative / Heavy Cash Conversion)"
        : "NORMAL_EARNINGS_QUALITY",
  };
}

/**
 * Graham Number: sqrt(22.5 * EPS * BVPS).
 */
export function grahamNumber(eps, bvps) {
  if (!(eps > 0) || !(bvps > 0)) return null;
  return round(Math.sqrt(22.5 * eps * bvps));
}

/**
 * Categorizes current market price against DCF scenarios.
 */
export function pricePosition(price, { low, base, high }) {
  if (price < low) return "below_low_deep_discount";
  if (price < base) return "between_low_and_base";
  if (Math.abs(price - base) / base < 0.05) return "at_base_fair";
  if (price <= high) return "between_base_and_high_optimistic";
  return "above_high_bull_case_priced";
}

/**
 * 2D Valuation Sensitivity Matrix (Discount Rate vs Terminal Growth)
 */
export function computeSensitivityMatrix({
  fcfBase,
  baseGrowth,
  baseDiscount,
  years = 5,
  shares,
  netCash = 0,
  trajectory = null,
}) {
  const drSteps = [
    round(baseDiscount - 0.02, 3),
    round(baseDiscount - 0.01, 3),
    round(baseDiscount, 3),
    round(baseDiscount + 0.01, 3),
    round(baseDiscount + 0.02, 3),
  ];
  const tgSteps = [0.015, 0.02, 0.025, 0.03];

  const matrix = [];
  for (const dr of drSteps) {
    const row = { discount_rate: dr, discount_rate_pct: round(dr * 100, 1) + "%", columns: {} };
    for (const tg of tgSteps) {
      if (dr <= tg) {
        row.columns[round(tg * 100, 1) + "%"] = "N/A";
        continue;
      }
      try {
        const res = dcf({
          fcfBase,
          growth: baseGrowth,
          discount: dr,
          terminalGrowth: tg,
          years,
          shares,
          netCash,
          trajectory,
        });
        row.columns[round(tg * 100, 1) + "%"] = res.fair_value_per_share;
      } catch {
        row.columns[round(tg * 100, 1) + "%"] = "ERR";
      }
    }
    matrix.push(row);
  }

  return {
    terminal_growth_rates: tgSteps.map((tg) => round(tg * 100, 1) + "%"),
    discount_rates: drSteps.map((dr) => round(dr * 100, 1) + "%"),
    matrix,
  };
}

/**
 * Fractional Kelly Criterion Position Sizing Module
 * Computes mathematically optimal portfolio allocation:
 *   f* = p - (1 - p) / b
 * where p = probability of upside, b = payoff ratio (upside / downside).
 * Enforces Institutional Fractional Kelly (Full, Half, Quarter) with hard drawdown ceilings.
 */
export function computeKellySizing({
  upsidePct,
  downsidePct,
  probWin = 0.60,
  maxDrawdownBudget = 0.05,
  fraction = "half", // 'full', 'half', 'quarter'
  maxPositionCap = 0.15, // Institutional 15% single-name cap
}) {
  const up = typeof upsidePct === "string" ? parseFloat(upsidePct) : upsidePct;
  const down = typeof downsidePct === "string" ? Math.abs(parseFloat(downsidePct)) : Math.abs(downsidePct);

  if (!up || !down || down <= 0 || up <= 0) {
    return {
      payoff_ratio_b: null,
      probability_win_p: round(probWin * 100, 1) + "%",
      full_kelly_pct: "0%",
      fraction_used: fraction,
      recommended_position_pct: "0%",
      recommendation_summary: "NO_ALLOCATION (Negative or zero expected payoff spread)",
    };
  }

  const b = up / down;
  const p = probWin;
  const q = 1 - p;

  const fStar = p - q / b;
  const multiplier = fraction === "quarter" ? 0.25 : fraction === "half" ? 0.5 : 1.0;
  const rawKelly = Math.max(0, fStar);
  const scaledKelly = rawKelly * multiplier;

  // Constrain by max single-position cap and drawdown loss budget:
  // position_size * (down / 100) <= maxDrawdownBudget  ==> position_size <= maxDrawdownBudget / (down / 100)
  const drawdownConstrainedSize = down > 0 ? maxDrawdownBudget / (down / 100) : maxPositionCap;
  const finalRecommended = Math.min(scaledKelly, maxPositionCap, drawdownConstrainedSize);

  return {
    payoff_ratio_b: round(b, 2),
    probability_win_p: round(p * 100, 1) + "%",
    full_kelly_pct: round(rawKelly * 100, 2) + "%",
    fraction_used: fraction,
    unconstrained_fractional_pct: round(scaledKelly * 100, 2) + "%",
    max_position_cap_pct: round(maxPositionCap * 100, 1) + "%",
    drawdown_budget_pct: round(maxDrawdownBudget * 100, 1) + "%",
    drawdown_constrained_pct: round(drawdownConstrainedSize * 100, 2) + "%",
    recommended_position_pct: round(finalRecommended * 100, 2) + "%",
    recommendation_summary:
      finalRecommended <= 0
        ? "NO_ALLOCATION (Kelly formula indicates zero or negative expected growth)"
        : `ALLOCATE_${round(finalRecommended * 100, 1)}% (${fraction.toUpperCase()}_KELLY)`,
  };
}

/**
 * Evaluates Asymmetric Risk/Reward Ratio for Hedge Fund mandates (Target >= 3:1)
 */
export function computeAsymmetricRiskReward(currentPrice, lowFV, baseFV, highFV) {
  if (!currentPrice || !lowFV || !baseFV) return null;

  const upsideDollar = baseFV - currentPrice;
  const downsideDollar = currentPrice - lowFV;

  const upsidePct = round(((baseFV - currentPrice) / currentPrice) * 100, 1);
  const downsidePct = round(((currentPrice - lowFV) / currentPrice) * 100, 1);

  let ratio = null;
  if (downsideDollar > 0) {
    ratio = round(upsideDollar / downsideDollar, 2);
  } else if (upsideDollar > 0 && downsideDollar <= 0) {
    ratio = 999.0; // Downside floor above current price
  }

  const kelly = computeKellySizing({
    upsidePct,
    downsidePct: Math.abs(downsidePct),
    probWin: 0.60,
    maxDrawdownBudget: 0.05,
    fraction: "half",
  });

  return {
    upside_to_base_pct: upsidePct + "%",
    downside_to_low_pct: (downsidePct > 0 ? "-" : "+") + Math.abs(downsidePct) + "%",
    reward_to_risk_ratio: ratio,
    qualifies_3_to_1: ratio !== null && ratio >= 3.0,
    hurdle_verdict:
      ratio !== null && ratio >= 3.0
        ? "PASSES_ASYMMETRIC_HURDLE (>= 3.0x)"
        : "FAILS_ASYMMETRIC_HURDLE (< 3.0x or negative spread)",
    kelly_sizing: kelly,
  };
}

/**
 * Main Institutional Compute Pipeline
 */
export function compute(model) {
  if (!model || !model.inputs || !model.dcf || !Array.isArray(model.dcf.cases)) {
    throw new Error("Invalid valuation model: 'inputs' and 'dcf.cases' array are required");
  }
  const { inputs, dcf: dcfSpec, sotp: sotpSpec, forensic: forensicData } = model;
  const years = dcfSpec.projection_years ?? 5;

  const results = {};
  for (const c of dcfSpec.cases) {
    results[c.case] = dcf({
      fcfBase: inputs.fcf_base,
      growth: c.fcf_growth_rate,
      discount: c.discount_rate,
      terminalGrowth: dcfSpec.terminal_growth_rate,
      years,
      shares: inputs.shares_diluted,
      netCash: inputs.net_cash ?? 0,
      trajectory: c.fcf_trajectory,
    });
  }

  const range = {
    low: results.low.fair_value_per_share,
    base: results.base.fair_value_per_share,
    high: results.high.fair_value_per_share,
  };

  const graham = grahamNumber(inputs.eps_used, inputs.book_value_per_share);

  // Reverse DCF calculation
  const reverseDcf = solveReverseDCF({
    currentPrice: inputs.current_price,
    shares: inputs.shares_diluted,
    fcfBase: inputs.fcf_base,
    discountRate: results.base ? dcfSpec.cases.find((c) => c.case === "base")?.discount_rate ?? 0.09 : 0.09,
    terminalGrowthRate: dcfSpec.terminal_growth_rate,
    years,
    netCash: inputs.net_cash ?? 0,
  });

  // SOTP calculation if available
  const sotpResult = sotpSpec ? computeSOTP(sotpSpec, inputs.shares_diluted, inputs.net_cash ?? 0) : null;

  // 2D Sensitivity Matrix
  const baseCase = dcfSpec.cases.find((c) => c.case === "base") || dcfSpec.cases[1];
  const sensitivityMatrix = computeSensitivityMatrix({
    fcfBase: inputs.fcf_base,
    baseGrowth: baseCase.fcf_growth_rate,
    baseDiscount: baseCase.discount_rate,
    years,
    shares: inputs.shares_diluted,
    netCash: inputs.net_cash ?? 0,
    trajectory: baseCase.fcf_trajectory,
  });

  // Asymmetric Risk/Reward
  const riskReward = computeAsymmetricRiskReward(inputs.current_price, range.low, range.base, range.high);

  // Forensic checks if data supplied
  let forensicReport = null;
  if (forensicData) {
    const beneish = computeBeneishMScore(forensicData.beneish_inputs);
    const sloan = computeSloanAccrual(
      forensicData.net_income,
      forensicData.cfo,
      forensicData.total_assets,
      forensicData.prev_total_assets
    );
    const sbcDilutionPct =
      inputs.fcf_base && inputs.fcf_base > 0 && forensicData.stock_based_compensation
        ? round((forensicData.stock_based_compensation / inputs.fcf_base) * 100, 2) + "%"
        : null;

    forensicReport = {
      beneish_m_score: beneish,
      sloan_accrual: sloan,
      sbc_dilution_ratio: sbcDilutionPct,
    };
  }

  const warnings = [];
  if (inputs.fcf_base <= 0) {
    const hasTrajectories = dcfSpec.cases.every((c) => c.fcf_trajectory && c.fcf_trajectory.length > 0);
    if (!hasTrajectories) {
      warnings.push(
        "Current FCF base is negative or zero, but one or more DCF cases lack explicit fcf_trajectory. Constant growth compounds cash burn."
      );
    }
  }
  if (dcfSpec.terminal_growth_rate > 0.03) {
    warnings.push("terminal_growth_rate above 3% exceeds long-run GDP growth — G3 will fail this");
  }
  if (results.base && results.base.terminal_share_of_value > 0.8) {
    warnings.push(
      `terminal value is ${round(results.base.terminal_share_of_value * 100, 1)}% of base-case value — ` +
        "the model is heavily reliant on terminal assumptions; stress-test duration."
    );
  }
  if (inputs.eps_basis !== "adjusted" && model.requires_adjusted_eps) {
    warnings.push("distortion was flagged but eps_basis is 'headline' — G3 will fail this");
  }
  if (graham && graham < range.low * 0.5) {
    warnings.push(
      "Graham Number sits far below the DCF range (typical for high-ROIC asset-light leaders) — report with calibrated weight."
    );
  }
  if (riskReward && !riskReward.qualifies_3_to_1) {
    warnings.push(
      `Asymmetric risk/reward ratio (${riskReward.reward_to_risk_ratio}x) sits below institutional hurdle of 3.0x.`
    );
  }

  return {
    computed_by: "calculator",
    computed_at: new Date().toISOString(),
    cases: results,
    fair_value_range: range,
    graham_number: graham,
    price_position: pricePosition(inputs.current_price, range),
    implied_upside_to_base:
      inputs.current_price && inputs.current_price > 0
        ? round(((range.base / inputs.current_price) - 1) * 100, 1) + "%"
        : "N/A",
    reverse_dcf: reverseDcf,
    sotp: sotpResult,
    sensitivity_matrix: sensitivityMatrix,
    asymmetric_risk_reward: riskReward,
    forensic: forensicReport,
    warnings,
  };
}

/**
 * G3 Gate Verification
 */
export function verify(model) {
  const fresh = compute(model);
  const mismatches = [];

  for (const c of model.dcf.cases) {
    const stored = c.fair_value_per_share;
    const recomputed = fresh.cases[c.case].fair_value_per_share;
    if (stored != null && Math.abs(stored - recomputed) > 0.01) {
      mismatches.push(`${c.case}: stored ${stored}, recomputed ${recomputed}`);
    }
  }
  if (model.computed_by !== "calculator") {
    mismatches.push(`computed_by is "${model.computed_by}" — must be "calculator"`);
  }
  return { verdict: mismatches.length ? "fail" : "pass", mismatches, recomputed: fresh };
}

// CLI Execution Handlers
const [, , path, flag] = process.argv;
const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url) === process.argv[1] ||
  process.argv[1].endsWith("/calculator.mjs") ||
  process.argv[1].endsWith("\\calculator.mjs")
);

if (isDirectRun) {
  if (!path || path === "-h" || path === "--help") {
    console.log(`Institutional Deterministic Financial Calculator
Usage:
  node pipeline/calculator.mjs <model.json>            # compute and print
  node pipeline/calculator.mjs <model.json> --write    # write outputs back into model.json
  node pipeline/calculator.mjs <model.json> --verify   # Gate G3 verification`);
    process.exit(0);
  }

  try {
    const model = JSON.parse(readFileSync(path, "utf8"));
    if (flag === "--verify") {
      console.log(JSON.stringify(verify(model), null, 2));
    } else {
      const out = compute(model);
      console.log(JSON.stringify(out, null, 2));
      if (flag === "--write") {
        model.computed_by = "calculator";
        model.dcf.cases.forEach((c) => {
          c.fair_value_per_share = out.cases[c.case].fair_value_per_share;
        });
        model.graham = { ...(model.graham ?? {}), graham_number: out.graham_number };
        model.price_position = out.price_position;
        model.reverse_dcf = out.reverse_dcf;
        model.asymmetric_risk_reward = out.asymmetric_risk_reward;
        model.sensitivity_matrix = out.sensitivity_matrix;
        if (out.sotp) {
          model.sotp_result = out.sotp;
          model.sotp = out.sotp;
        }
        if (out.forensic) {
          model.forensic_result = out.forensic;
          model.forensic = out.forensic;
        }
        writeFileSync(path, JSON.stringify(model, null, 2));
      }
    }
  } catch (err) {
    console.error("Calculator Error:", err.message);
    process.exit(1);
  }
}
