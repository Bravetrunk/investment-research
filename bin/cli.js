#!/usr/bin/env node
/**
 * investment-research
 * Unified CLI for Institutional Multi-Agent Hedge Fund & Tier-1 VC Equity Research.
 *
 * Commands:
 *   investment-research init <TICKER> [--dir <PATH>]
 *   investment-research calc <model.json> [--write] [--verify]
 *   investment-research export <TICKER_OR_DIR>
 *   investment-research screen <T1> <T2>... [--out <DIR>]
 *   investment-research status <TICKER> [--dir <PATH>]
 *   investment-research mcp
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join, basename } from "node:path";
import { homedir } from "node:os";
import { spawnSync, fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runCli } from "../pipeline/calculator.mjs";
import { findPythonExecutable } from "../pipeline/python-finder.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const REPO_ROOT = resolve(__dirname, "..");

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  white: "\x1b[37m",
};

function printBanner() {
  console.log(`\n${c.bold}${c.cyan}================================================================================${c.reset}`);
  console.log(` ${c.bold}${c.white}🏛️  INSTITUTIONAL MULTI-AGENT EQUITY RESEARCH SYSTEM${c.reset} ${c.dim}(v1.0.0)${c.reset}`);
  console.log(` ${c.dim}Hedge Fund & Tier-1 VC Valuation Engine | Zero-Dependency OpenXML & Excel${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================================================${c.reset}\n`);
}

function printHelp() {
  printBanner();
  console.log(`${c.bold}USAGE:${c.reset}`);
  console.log(`  ${c.green}investment-research${c.reset} <command> [options]\n`);
  console.log(`${c.bold}COMMANDS:${c.reset}`);
  console.log(`  ${c.cyan}init <TICKER>${c.reset}                   Scaffold institutional workspace at ~/Desktop/<TICKER>/`);
  console.log(`  ${c.cyan}calc <model.json>${c.reset}               Run deterministic DCF, Reverse DCF, SOTP & sensitivities`);
  console.log(`       [--write]                  Write computed valuation results back into model.json`);
  console.log(`       [--verify]                 Gate G3 verification: verify mathematical reproducibility`);
  console.log(`  ${c.cyan}export <TICKER_OR_DIR>${c.reset}          Compile RESEARCH.docx & QUANT_ANALYSIS.xlsx (6 tabs)`);
  console.log(`  ${c.cyan}screen <T1> <T2>...${c.reset}             Compare multiple screen candidates into SCREEN_COMPARISON.xlsx`);
  console.log(`       [--out <DIR>]              Custom output directory (default: ~/Desktop/)`);
  console.log(`  ${c.cyan}status <TICKER>${c.reset}                 Audit research artifacts and quality gates for a ticker`);
  console.log(`  ${c.cyan}mcp${c.reset}                             Start Model Context Protocol (MCP) server over stdio`);
  console.log(`  ${c.cyan}--version, -v${c.reset}                   Print system version`);
  console.log(`  ${c.cyan}--help, -h${c.reset}                      Print this help manual\n`);
  console.log(`${c.bold}EXAMPLES:${c.reset}`);
  console.log(`  ${c.dim}# 1. Initialize workspace for Constellation Energy${c.reset}`);
  console.log(`  investment-research init CEG\n`);
  console.log(`  ${c.dim}# 2. Run deterministic valuation calculator & write outputs${c.reset}`);
  console.log(`  investment-research calc ~/Desktop/CEG/valuation-model.json --write\n`);
  console.log(`  ${c.dim}# 3. Export publication-grade Word memo & 6-tab Excel model${c.reset}`);
  console.log(`  investment-research export CEG\n`);
  console.log(`  ${c.dim}# 4. Screen comparison across nuclear/power thesis candidates${c.reset}`);
  console.log(`  investment-research screen CEG VST CCJ --out ~/Desktop/Power_Screen\n`);
}

function resolveWorkspace(target, customDir = null) {
  if (customDir) return resolve(customDir);
  const desktop = join(homedir(), "Desktop");
  const raw = target.trim();
  if (raw.startsWith("/") || raw.startsWith("~") || raw.includes("/") || raw.includes("\\")) {
    return resolve(raw.replace(/^~/, homedir()));
  }
  return join(desktop, raw.toUpperCase());
}

function initCommand(ticker, options) {
  if (!ticker) {
    console.error(`${c.red}[!] Error: Please specify a ticker symbol (e.g. investment-research init CEG)${c.reset}`);
    process.exit(1);
  }
  const cleanTicker = ticker.toUpperCase();
  const dir = resolveWorkspace(cleanTicker, options.dir);

  mkdirSync(dir, { recursive: true });

  const modelPath = join(dir, "valuation-model.json");
  if (!existsSync(modelPath)) {
    const starterModel = {
      ticker: cleanTicker,
      inputs: {
        eps_used: 8.5,
        eps_basis: "adjusted",
        fcf_base: 3200.0,
        fcf_basis: "normalized",
        shares_diluted: 315.0,
        book_value_per_share: 45.0,
        current_price: 150.0,
        net_cash: -1500.0,
      },
      dcf: {
        projection_years: 5,
        terminal_growth_rate: 0.025,
        cases: [
          { case: "low", fcf_growth_rate: 0.05, discount_rate: 0.10, rationale: "Conservative energy prices & capex headwinds" },
          { case: "base", fcf_growth_rate: 0.12, discount_rate: 0.085, rationale: "Contracted hyperscale PPA baseline" },
          { case: "high", fcf_growth_rate: 0.18, discount_rate: 0.075, rationale: "Accelerated tech capacity restart" },
        ],
      },
      graham: { applicability: "meaningful" },
      relative: { multiples: [] },
      sensitivity: {
        wacc_range: [0.07, 0.08, 0.085, 0.09, 0.10],
        terminal_growth_range: [0.015, 0.02, 0.025, 0.03],
      },
      sotp: {
        segments: [
          { name: "Core Generation", metric_type: "ebitda", metric_value: 3500.0, multiple: 12.0 },
          { name: "Nuclear Hyperscale PPA", metric_type: "ebitda", metric_value: 1200.0, multiple: 18.0 },
        ],
      },
      forensic: {
        beneish: {
          dsri: 1.02,
          gmi: 0.98,
          aqi: 1.01,
          sgi: 1.15,
          depi: 0.99,
          sgai: 0.95,
          lvgi: 1.05,
          tata: 0.02,
        },
        sloan: {
          net_income: 2800.0,
          cfo: 3400.0,
          avg_total_assets: 35000.0,
        },
      },
      computed_by: "uncomputed",
    };
    writeFileSync(modelPath, JSON.stringify(starterModel, null, 2), "utf8");
    console.log(`${c.green}[+] Initialized valuation model:${c.reset} ${modelPath}`);
  } else {
    console.log(`${c.dim}[*] valuation-model.json already exists in ${dir}${c.reset}`);
  }

  const snapPath = join(dir, "financial-snapshot.json");
  if (!existsSync(snapPath)) {
    const starterSnapshot = {
      ticker: cleanTicker,
      retrieved_at: new Date().toISOString(),
      market_metrics: {
        current_price: 150.0,
        market_cap: 47250.0,
        enterprise_value: 48750.0,
        pe_ratio: 24.5,
        ev_ebitda: 14.2,
      },
      balance_sheet: {
        cash_and_equivalents: 2500.0,
        total_debt: 4000.0,
        net_debt: 1500.0,
        net_debt_to_ebitda: 1.25,
      },
    };
    writeFileSync(snapPath, JSON.stringify(starterSnapshot, null, 2), "utf8");
    console.log(`${c.green}[+] Initialized financial snapshot:${c.reset} ${snapPath}`);
  }

  console.log(`\n${c.bold}${c.green}✓ Workspace initialized successfully at:${c.reset} ${dir}`);
  console.log(`${c.dim}Next steps:${c.reset}`);
  console.log(`  1. Edit assumptions: ${c.cyan}${modelPath}${c.reset}`);
  console.log(`  2. Compute deterministic valuation: ${c.cyan}investment-research calc "${modelPath}" --write${c.reset}`);
  console.log(`  3. Export institutional memo and 6-tab Excel: ${c.cyan}investment-research export "${dir}"${c.reset}\n`);
}

function statusCommand(ticker, options) {
  if (!ticker) {
    console.error(`${c.red}[!] Error: Please specify a ticker symbol (e.g. investment-research status CEG)${c.reset}`);
    process.exit(1);
  }
  const cleanTicker = ticker.toUpperCase();
  const dir = resolveWorkspace(cleanTicker, options.dir);

  printBanner();
  console.log(`${c.bold}AUDIT REPORT FOR WORKSPACE:${c.reset} ${c.cyan}${cleanTicker}${c.reset} -> ${c.dim}${dir}${c.reset}\n`);

  if (!existsSync(dir)) {
    console.log(`${c.yellow}[!] Workspace folder does not exist yet.${c.reset}`);
    console.log(`    Run: ${c.green}investment-research init ${cleanTicker}${c.reset} to scaffold it.\n`);
    return;
  }

  const filesToCheck = [
    { file: "financial-snapshot.json", desc: "Data Retrieval (Market & Balance Sheet)" },
    { file: "valuation-model.json", desc: "Valuation Assumptions & Deterministic Math" },
    { file: "forensic-report.json", desc: "Forensic Accounting (Beneish & Sloan)" },
    { file: "ic-verdict.json", desc: "Investment Committee Deliberation" },
    { file: "thesis-record.json", desc: "Thesis Kill Criteria & Invalidation Triggers" },
    { file: "RESEARCH.md", desc: "Executive Markdown Memo" },
    { file: "RESEARCH.docx", desc: "Publication-Grade Word Memo" },
    { file: "QUANT_ANALYSIS.xlsx", desc: "Institutional 6-Tab Financial Workbook" },
  ];

  console.log(`${c.bold}Artifacts Status:${c.reset}`);
  for (const item of filesToCheck) {
    const p = join(dir, item.file);
    const exists = existsSync(p);
    const badge = exists ? `${c.green}[✓ FOUND]${c.reset}` : `${c.dim}[✗ MISSING]${c.reset}`;
    console.log(`  ${badge} ${c.white}${item.file.padEnd(23)}${c.reset} ${c.dim}(${item.desc})${c.reset}`);
  }

  const modelPath = join(dir, "valuation-model.json");
  if (existsSync(modelPath)) {
    try {
      const data = JSON.parse(readFileSync(modelPath, "utf8"));
      console.log(`\n${c.bold}Deterministic Valuation Metrics:${c.reset}`);
      console.log(`  Engine Status:       ${data.computed_by === "calculator" ? c.green + "COMPUTED BY CODE" : c.yellow + "UNCOMPUTED"} ${c.reset}`);
      if (data.dcf?.cases) {
        data.dcf.cases.forEach((cs) => {
          console.log(`  DCF Fair Value (${cs.case}): $${cs.fair_value_per_share ?? "N/A"}`);
        });
      }
      if (data.reverse_dcf?.implied_fcf_growth_rate !== undefined) {
        console.log(`  Reverse DCF Implied: ${(data.reverse_dcf.implied_fcf_growth_rate * 100).toFixed(2)}% CAGR`);
      }
      if (data.asymmetric_risk_reward?.reward_to_risk_ratio !== undefined) {
        const rr = data.asymmetric_risk_reward.reward_to_risk_ratio;
        const color = rr >= 3.0 ? c.green : c.red;
        console.log(`  Reward/Risk Hurdle:  ${color}${rr}x ${rr >= 3.0 ? "(Meets 3:1 Hurdle)" : "(Fails 3:1 Hurdle)"}${c.reset}`);
      }
      const forensicObj = data.forensic_result || data.forensic;
      if (forensicObj?.beneish_m_score) {
        const bm = forensicObj.beneish_m_score;
        const bColor = bm.is_manipulator_probability_high ? c.red : c.green;
        console.log(`  Beneish M-Score:     ${bColor}${bm.m_score} (${bm.verdict})${c.reset}`);
      }
      if (forensicObj?.sloan_accrual) {
        const sl = forensicObj.sloan_accrual;
        console.log(`  Sloan Accrual:       ${sl.accrual_pct} (${sl.quality_band})`);
      }
    } catch (e) {
      console.log(`${c.red}[!] Failed parsing valuation-model.json: ${e.message}${c.reset}`);
    }
  }

  const verdictPath = join(dir, "ic-verdict.json");
  if (existsSync(verdictPath)) {
    try {
      const v = JSON.parse(readFileSync(verdictPath, "utf8"));
      console.log(`\n${c.bold}IC Mandate:${c.reset}`);
      console.log(`  Verdict:             ${c.green}${v.verdict ?? "PENDING"}${c.reset}`);
      console.log(`  Conviction Tier:     ${v.conviction_tier ?? "N/A"}`);
      console.log(`  Kelly Allocation:    ${v.sizing_mandate?.recommended_allocation_pct ?? "N/A"}`);
    } catch {}
  }
  console.log("");
}

function exportCommand(args) {
  const py = findPythonExecutable();
  if (!py) {
    console.error(`${c.red}[!] Error: Python 3.8+ is required for OpenXML Word & Excel export, but no working Python interpreter was found.${c.reset}`);
    console.error(`    Please ensure Python 3 is installed or set the PYTHON environment variable (e.g. export PYTHON=/usr/bin/python3).`);
    process.exit(1);
  }
  const exporterScript = join(REPO_ROOT, "pipeline", "exporter.py");
  const pyArgs = [exporterScript, ...args];
  const res = spawnSync(py, pyArgs, { stdio: "inherit" });
  if (res.error) {
    console.error(`${c.red}[!] Export failed to execute:${c.reset}`, res.error.message);
    process.exit(1);
  }
  process.exit(res.status ?? 0);
}

function mcpCommand() {
  const mcpScript = join(__dirname, "mcp-server.js");
  const child = fork(mcpScript, [], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
}

// ==============================================================================
// Argument Parsing & Routing
// ==============================================================================
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "-h" || command === "--help") {
  printHelp();
  process.exit(0);
}

if (command === "-v" || command === "--version") {
  console.log("investment-research v1.0.0");
  process.exit(0);
}

switch (command) {
  case "calc": {
    const calcArgs = ["node", "calculator.mjs", ...args.slice(1)];
    runCli(calcArgs);
    break;
  }
  case "init": {
    let ticker = "";
    let customDir = null;
    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--dir" && i + 1 < args.length) {
        customDir = args[++i];
      } else if (!ticker && !args[i].startsWith("-")) {
        ticker = args[i];
      }
    }
    initCommand(ticker, { dir: customDir });
    break;
  }
  case "status": {
    let ticker = "";
    let customDir = null;
    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--dir" && i + 1 < args.length) {
        customDir = args[++i];
      } else if (!ticker && !args[i].startsWith("-")) {
        ticker = args[i];
      }
    }
    statusCommand(ticker, { dir: customDir });
    break;
  }
  case "export": {
    exportCommand(args.slice(1));
    break;
  }
  case "screen": {
    exportCommand(["--screen", ...args.slice(1)]);
    break;
  }
  case "mcp": {
    mcpCommand();
    break;
  }
  default: {
    console.error(`${c.red}[!] Unknown command: ${command}${c.reset}`);
    printHelp();
    process.exit(1);
  }
}
