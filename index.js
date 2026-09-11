/**
 * Institutional Multi-Agent Hedge Fund & Tier-1 VC Equity Research Engine
 *
 * Programmatic Entry Point (Node.js 18+ ES Module)
 * Zero external dependencies.
 */

import {
  round,
  dcf,
  solveReverseDCF,
  computeSOTP,
  computeBeneishMScore,
  computeSloanAccrual,
  computeKellySizing,
  computeAsymmetricRiskReward,
  grahamNumber,
  pricePosition,
  computeSensitivityMatrix,
  computeMonteCarloDCF,
  computeLBO,
  compute,
  verify,
  runCli,
} from "./pipeline/calculator.mjs";

// Convenience aliases
export const beneish = computeBeneishMScore;
export const sloan = (...args) => {
  if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
    const a = args[0];
    return computeSloanAccrual(
      a.netIncome ?? a.net_income,
      a.cfo,
      a.avgTotalAssets ?? a.avg_total_assets ?? a.totalAssets ?? a.total_assets,
      a.prevTotalAssets ?? a.prev_total_assets ?? null
    );
  }
  return computeSloanAccrual(...args);
};
export const sotp = (...args) => {
  if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && args[0].segments) {
    const a = args[0];
    return computeSOTP(a, a.shares ?? a.shares_diluted, a.netCash ?? a.net_cash ?? 0);
  }
  return computeSOTP(...args);
};
export const fractionalKelly = computeKellySizing;

export {
  round,
  dcf,
  solveReverseDCF,
  computeSOTP,
  computeBeneishMScore,
  computeSloanAccrual,
  computeKellySizing,
  computeAsymmetricRiskReward,
  grahamNumber,
  pricePosition,
  computeSensitivityMatrix,
  computeMonteCarloDCF,
  computeLBO,
  compute,
  verify,
  runCli,
};

/**
 * Institutional 5 Master Investment Theses
 */
export const MASTER_THEMES = [
  {
    id: "liquid_cooling_2026",
    title: "Liquid Cooling & Water Infrastructure 2026",
    bottlenecks: ["Air cooling limit >35kW/rack", "Two-Phase Direct-to-Chip (D2C)", "Water permitting crisis"],
    benchmark_names: ["VRT", "MOD", "ETN", "XYL", "ECL"],
  },
  {
    id: "agentic_micropayments_2026",
    title: "Agentic Payment System & Economy (M2M Micropayments)",
    bottlenecks: ["Machine-to-Machine sub-dollar transactions", "x402/ERC-8004 protocol stack", "Card interchange breakdown"],
    benchmark_names: ["V", "MA", "COIN"],
  },
  {
    id: "physical_ai_robotics_2026",
    title: "Physical AI & Robotics",
    bottlenecks: ["Humanoid robot BOM cost deflation (~40%/yr)", "Sim-to-Real CUDA moats", "Harmonic drives & vision silicon"],
    benchmark_names: ["NVDA", "AMBA", "TSLA", "SYM", "ROK", "TER"],
  },
  {
    id: "local_vs_cloud_ai_2026",
    title: "Local AI vs Cloud AI 2026",
    bottlenecks: ["Hyperscale Capex ROI scrutiny", "Edge NPU token cost arbitrage (10-60x cheaper)", "Heterogeneous NPU tooling"],
    benchmark_names: ["AAPL", "QCOM", "INTC", "AMD"],
  },
  {
    id: "allied_rearmament_garp_2026",
    title: "Allied Rearmament & Defense GARP Screen",
    bottlenecks: ["Multi-year munitions backlog", "Golden Dome defense", "Free cash flow durability"],
    benchmark_names: ["LMT", "NOC", "GD"],
  },
];

/**
 * Institutional Passing Discipline Precedent Rules
 */
export const PASSING_DISCIPLINE_RULES = {
  CYCLICAL_COMMODITY_TRAP: {
    id: "CYCLICAL_COMMODITY_TRAP",
    archetype_example: "MU (Micron)",
    rationale: "Peak cycle multiples deceive; high capex burdens and commoditized pricing mandate passing when trading above normalized replacement value.",
    default_verdict: "PASSED",
  },
  MULTIPLE_DERATING_CANNIBALIZATION: {
    id: "MULTIPLE_DERATING_CANNIBALIZATION",
    archetype_example: "ISRG (Intuitive Surgical)",
    rationale: "40x+ forward P/E is unsustainable when well-funded enterprise competitors secure regulatory clearances and initiate price compression.",
    default_verdict: "PASSED",
  },
  EXCESSIVE_LEVERAGE: {
    id: "EXCESSIVE_LEVERAGE",
    archetype_example: "EQIX (Equinix)",
    rationale: "Net Debt / EBITDA > 4.0x ceiling leaves equity vulnerable to refinancing cliffs and eliminates margin of safety.",
    default_verdict: "PASSED",
  },
  STRUCTURAL_PRICE_WAR: {
    id: "STRUCTURAL_PRICE_WAR",
    archetype_example: "BABA (Alibaba)",
    rationale: "Structural domestic price wars and sovereign discount perpetually compress equity multiples.",
    default_verdict: "PASSED",
  },
  SCALE_DISADVANTAGE: {
    id: "SCALE_DISADVANTAGE",
    archetype_example: "AMBA (Ambarella)",
    rationale: "Sub-scale R&D spending vs hyperscale silicon giants erodes pricing power and gross margins.",
    default_verdict: "PASSED",
  },
};

/**
 * Evaluates target parameters against Investment Committee Passing Discipline hurdles.
 */
export function evaluatePassingDiscipline({
  ticker,
  netDebtToEbitda = null,
  peRatio = null,
  archetype = null,
  fcfMargin = null,
  hasPricingPower = true,
  notes = "",
}) {
  const flags = [];
  let verdict = "APPROVED_LONG";
  let rationale = "No disqualifying institutional failure modes detected. Passes fundamental gates.";

  if (netDebtToEbitda !== null && netDebtToEbitda > 4.0) {
    flags.push(`Net Debt / EBITDA (${netDebtToEbitda.toFixed(2)}x) exceeds strict risk ceiling of 4.0x.`);
  }

  if (archetype && PASSING_DISCIPLINE_RULES[archetype]) {
    const rule = PASSING_DISCIPLINE_RULES[archetype];
    flags.push(`Triggered precedent rule [${rule.id}]: ${rule.rationale} (Historical benchmark: ${rule.archetype_example}).`);
  }

  if (peRatio !== null && peRatio > 50 && !hasPricingPower) {
    flags.push(`Extreme multiple (${peRatio.toFixed(1)}x P/E) without durable pricing power invites multiple derating.`);
  }

  if (fcfMargin !== null && fcfMargin < 0) {
    flags.push(`Negative normalized FCF margin (${(fcfMargin * 100).toFixed(1)}%) violates cash conversion requirements.`);
  }

  if (flags.length > 0) {
    verdict = "PASSED";
    rationale = `Investment Committee strictly passes on ${ticker ? ticker.toUpperCase() : "TARGET"} due to: ${flags.join(" ")}`;
  }

  return {
    ticker: ticker ? ticker.toUpperCase() : "UNKNOWN",
    verdict,
    passed_discipline: verdict === "PASSED",
    flags,
    rationale,
    timestamp: new Date().toISOString(),
  };
}

export default {
  round,
  dcf,
  solveReverseDCF,
  computeSOTP,
  computeBeneishMScore,
  computeSloanAccrual,
  computeKellySizing,
  computeAsymmetricRiskReward,
  grahamNumber,
  pricePosition,
  computeSensitivityMatrix,
  computeMonteCarloDCF,
  computeLBO,
  compute,
  verify,
  runCli,
  beneish,
  sloan,
  sotp,
  fractionalKelly,
  evaluatePassingDiscipline,
  MASTER_THEMES,
  PASSING_DISCIPLINE_RULES,
};
