#!/usr/bin/env node
/**
 * Model Context Protocol (MCP) Stdio Server
 * Compatible with Claude Code, Claude Desktop, Cursor, Windsurf, Antigravity, Cline, Roo Code
 * Zero external dependencies. Node.js 18+.
 */

import readline from "node:readline";
import { resolve, join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  compute,
  verify,
  solveReverseDCF,
  sotp,
  beneish,
  sloan,
  evaluatePassingDiscipline,
} from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const REPO_ROOT = resolve(__dirname, "..");

const TOOLS = [
  {
    name: "calculate_valuation",
    description: "Institutional deterministic financial valuation engine. Computes multi-stage DCF (base/bull/bear), Reverse DCF market-implied growth rate CAGR, Graham Number, 2D sensitivity matrix (WACC vs Terminal Growth), price position, and 3:1 asymmetric risk/reward ratio in deterministic code. Zero hallucinated token math.",
    inputSchema: {
      type: "object",
      properties: {
        model_path: {
          type: "string",
          description: "Absolute or relative path to valuation-model.json (e.g., '~/Desktop/CEG/valuation-model.json')"
        },
        model: {
          type: "object",
          description: "Direct in-memory valuation model JSON object according to valuation-model.schema.json"
        },
        write_back: {
          type: "boolean",
          description: "If true and model_path is provided, writes computed outputs back into the file"
        }
      }
    }
  },
  {
    name: "solve_reverse_dcf",
    description: "Reverse DCF Solver: Solves for the implied constant FCF growth rate CAGR embedded in the current market price using deterministic code.",
    inputSchema: {
      type: "object",
      properties: {
        current_price: { type: "number", description: "Current market share price in USD" },
        shares: { type: "number", description: "Diluted shares outstanding in millions" },
        fcf_base: { type: "number", description: "Base year free cash flow in millions" },
        discount_rate: { type: "number", description: "WACC or discount rate (e.g. 0.09 for 9%)" },
        terminal_growth_rate: { type: "number", description: "Perpetual terminal growth rate (e.g. 0.025 for 2.5%)" },
        years: { type: "number", description: "Explicit forecast horizon in years (default: 5)" },
        net_cash: { type: "number", description: "Net cash (cash - debt) in millions (default: 0)" }
      },
      required: ["current_price", "shares", "fcf_base", "discount_rate", "terminal_growth_rate"]
    }
  },
  {
    name: "calculate_sotp",
    description: "Sum-of-the-Parts (SOTP) Valuation: Computes conglomerate enterprise value by summing segment EBITDA/Revenue multiples and bridges to equity fair value per share.",
    inputSchema: {
      type: "object",
      properties: {
        shares_diluted: { type: "number", description: "Diluted shares outstanding in millions" },
        net_cash: { type: "number", description: "Net cash (cash - total debt) in millions (default: 0)" },
        segments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              metric_type: { type: "string", enum: ["revenue", "ebitda", "ebit", "fcf"] },
              metric_value: { type: "number" },
              multiple: { type: "number" },
              multiple_source: { type: "string" }
            },
            required: ["name", "metric_type", "metric_value", "multiple"]
          },
          description: "List of business units with respective operating metric and assigned valuation multiple"
        }
      },
      required: ["shares_diluted", "segments"]
    }
  },
  {
    name: "calculate_forensic_accounting",
    description: "Forensic Accounting & Earnings Quality Auditor: Computes the complete 8-factor Beneish M-Score (-1.78 threshold) and Sloan Accrual Ratio ([-10%, +10%] band) to detect financial manipulation and earnings distortion.",
    inputSchema: {
      type: "object",
      properties: {
        beneish: {
          type: "object",
          properties: {
            dsri: { type: "number", description: "Days Sales in Receivables Index" },
            gmi: { type: "number", description: "Gross Margin Index" },
            aqi: { type: "number", description: "Asset Quality Index" },
            sgi: { type: "number", description: "Sales Growth Index" },
            depi: { type: "number", description: "Depreciation Index" },
            sgai: { type: "number", description: "Sales General & Admin Expenses Index" },
            lvgi: { type: "number", description: "Leverage Index" },
            tata: { type: "number", description: "Total Accruals to Total Assets" }
          }
        },
        sloan: {
          type: "object",
          properties: {
            net_income: { type: "number", description: "Net Income in millions" },
            cfo: { type: "number", description: "Cash Flow from Operations in millions" },
            avg_total_assets: { type: "number", description: "Average Total Assets across period in millions" }
          },
          required: ["net_income", "cfo", "avg_total_assets"]
        }
      }
    }
  },
  {
    name: "evaluate_passing_discipline",
    description: "Evaluates a target company against the institutional Investment Committee Passing Discipline Framework (e.g. Cyclical Commodity Traps, Multiple Derating from Cannibalization, Net Debt/EBITDA > 4.0x ceiling, Structural Price Wars, Scale Disadvantages).",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Stock ticker symbol (e.g. 'MU', 'ISRG', 'EQIX')" },
        net_debt_to_ebitda: { type: "number", description: "Net Debt / EBITDA leverage ratio" },
        pe_ratio: { type: "number", description: "Price to Earnings ratio" },
        archetype: {
          type: "string",
          enum: [
            "CYCLICAL_COMMODITY_TRAP",
            "MULTIPLE_DERATING_CANNIBALIZATION",
            "EXCESSIVE_LEVERAGE",
            "STRUCTURAL_PRICE_WAR",
            "SCALE_DISADVANTAGE"
          ],
          description: "Precedent failure mode archetype"
        },
        fcf_margin: { type: "number", description: "FCF margin (e.g. -0.05 for -5%)" },
        has_pricing_power: { type: "boolean", description: "Whether the company has durable pricing power" },
        notes: { type: "string", description: "Contextual qualitative notes" }
      },
      required: ["ticker"]
    }
  },
  {
    name: "export_research_artifacts",
    description: "Institutional Exporter: Compiles publication-grade 8-section Word memo (RESEARCH.docx) and 6-tab financial workbook (QUANT_ANALYSIS.xlsx) directly into ~/Desktop/<TICKER>/ or runs multi-candidate screen comparison (SCREEN_COMPARISON.xlsx).",
    inputSchema: {
      type: "object",
      properties: {
        ticker_or_dir: {
          type: "string",
          description: "Ticker symbol (e.g. 'CEG') or full path to research folder"
        },
        screen_tickers: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of tickers to compare across (e.g. ['CEG', 'VST', 'CCJ'])"
        },
        out_dir: {
          type: "string",
          description: "Custom output directory for comparison output"
        }
      }
    }
  },
  {
    name: "init_workspace",
    description: "Scaffolds institutional research folder structure with template valuation-model.json and financial-snapshot.json at ~/Desktop/<TICKER>/.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Stock ticker symbol (e.g. 'CEG')" },
        target_dir: { type: "string", description: "Optional custom workspace path" }
      },
      required: ["ticker"]
    }
  },
  {
    name: "verify_valuation_model",
    description: "Gate G3 Mathematical Verification: Checks numerical consistency between stored DCF fair values and recomputed outputs in code.",
    inputSchema: {
      type: "object",
      properties: {
        model_path: { type: "string", description: "Path to valuation-model.json to verify" }
      },
      required: ["model_path"]
    }
  }
];

function sendResponse(response) {
  process.stdout.write(JSON.stringify(response) + "\n");
}

function resolvePath(p) {
  if (!p) return "";
  if (p.startsWith("~/")) {
    return join(homedir(), p.slice(2));
  }
  return resolve(p);
}

function handleMessage(msg) {
  if (!msg || typeof msg !== "object") return;

  if (msg.method === "initialize") {
    sendResponse({
      jsonrpc: "2.0",
      id: msg.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "investment-research-mcp",
          version: "1.0.0"
        }
      }
    });
    return;
  }

  if (msg.method === "notifications/initialized") {
    return;
  }

  if (msg.method === "ping") {
    sendResponse({ jsonrpc: "2.0", id: msg.id, result: {} });
    return;
  }

  if (msg.method === "tools/list") {
    sendResponse({
      jsonrpc: "2.0",
      id: msg.id,
      result: { tools: TOOLS }
    });
    return;
  }

  if (msg.method === "tools/call") {
    const { name, arguments: args = {} } = msg.params || {};
    try {
      let resultText = "";

      if (name === "calculate_valuation") {
        let model = null;
        let p = null;
        if (args.model) {
          model = args.model;
        } else if (args.model_path) {
          p = resolvePath(args.model_path);
          if (!existsSync(p)) throw new Error(`Model file not found: ${p}`);
          model = JSON.parse(readFileSync(p, "utf8"));
        } else {
          throw new Error("Either 'model' object or 'model_path' string must be provided.");
        }

        const computed = compute(model);
        if (args.write_back && p) {
          model.computed_by = "calculator";
          model.dcf.cases.forEach((c) => {
            c.fair_value_per_share = computed.cases[c.case].fair_value_per_share;
          });
          model.graham = { ...(model.graham ?? {}), graham_number: computed.graham_number };
          model.price_position = computed.price_position;
          model.reverse_dcf = computed.reverse_dcf;
          model.asymmetric_risk_reward = computed.asymmetric_risk_reward;
          model.sensitivity_matrix = computed.sensitivity_matrix;
          if (computed.sotp) model.sotp = computed.sotp;
          if (computed.forensic) model.forensic = computed.forensic;
          writeFileSync(p, JSON.stringify(model, null, 2), "utf8");
          computed._written_to = p;
        }
        resultText = JSON.stringify(computed, null, 2);
      } else if (name === "solve_reverse_dcf") {
        const res = solveReverseDCF({
          currentPrice: Number(args.current_price),
          shares: Number(args.shares),
          fcfBase: Number(args.fcf_base),
          discountRate: Number(args.discount_rate),
          terminalGrowthRate: Number(args.terminal_growth_rate),
          years: args.years !== undefined ? Number(args.years) : 5,
          netCash: args.net_cash !== undefined ? Number(args.net_cash) : 0,
        });
        resultText = JSON.stringify(res, null, 2);
      } else if (name === "calculate_sotp") {
        const res = sotp({
          segments: args.segments,
          shares: Number(args.shares_diluted),
          netCash: args.net_cash !== undefined ? Number(args.net_cash) : 0,
        });
        resultText = JSON.stringify(res, null, 2);
      } else if (name === "calculate_forensic_accounting") {
        const res = {};
        if (args.beneish) {
          res.beneish = beneish(args.beneish);
        }
        if (args.sloan) {
          res.sloan = sloan({
            netIncome: Number(args.sloan.net_income),
            cfo: Number(args.sloan.cfo),
            avgTotalAssets: Number(args.sloan.avg_total_assets),
          });
        }
        resultText = JSON.stringify(res, null, 2);
      } else if (name === "evaluate_passing_discipline") {
        const res = evaluatePassingDiscipline({
          ticker: args.ticker,
          netDebtToEbitda: args.net_debt_to_ebitda !== undefined ? Number(args.net_debt_to_ebitda) : null,
          peRatio: args.pe_ratio !== undefined ? Number(args.pe_ratio) : null,
          archetype: args.archetype,
          fcfMargin: args.fcf_margin !== undefined ? Number(args.fcf_margin) : null,
          hasPricingPower: args.has_pricing_power !== undefined ? Boolean(args.has_pricing_power) : true,
          notes: args.notes || "",
        });
        resultText = JSON.stringify(res, null, 2);
      } else if (name === "export_research_artifacts") {
        const exporterScript = join(REPO_ROOT, "pipeline", "exporter.py");
        let pyArgs = [exporterScript];
        if (args.screen_tickers && args.screen_tickers.length > 0) {
          pyArgs.push("--screen", ...args.screen_tickers);
          if (args.out_dir) pyArgs.push("--out", resolvePath(args.out_dir));
        } else if (args.ticker_or_dir) {
          pyArgs.push(resolvePath(args.ticker_or_dir));
        } else {
          throw new Error("Must provide either 'ticker_or_dir' or 'screen_tickers'.");
        }
        const child = spawnSync("python3", pyArgs, { encoding: "utf8" });
        if (child.error) throw child.error;
        resultText = child.stdout || child.stderr || "Exporter executed successfully.";
      } else if (name === "init_workspace") {
        const ticker = args.ticker.toUpperCase();
        const dir = args.target_dir ? resolvePath(args.target_dir) : join(homedir(), "Desktop", ticker);
        mkdirSync(dir, { recursive: true });
        const modelPath = join(dir, "valuation-model.json");
        if (!existsSync(modelPath)) {
          const starter = {
            ticker,
            inputs: {
              eps_used: 5.0,
              eps_basis: "adjusted",
              fcf_base: 500.0,
              fcf_basis: "normalized",
              shares_diluted: 100.0,
              book_value_per_share: 30.0,
              current_price: 100.0,
              net_cash: 0,
            },
            dcf: {
              projection_years: 5,
              terminal_growth_rate: 0.025,
              cases: [
                { case: "low", fcf_growth_rate: 0.05, discount_rate: 0.10, rationale: "Bear floor" },
                { case: "base", fcf_growth_rate: 0.10, discount_rate: 0.085, rationale: "Base forecast" },
                { case: "high", fcf_growth_rate: 0.15, discount_rate: 0.075, rationale: "Bull upside" },
              ],
            },
            graham: { applicability: "meaningful" },
            relative: { multiples: [] },
            sensitivity: {
              wacc_range: [0.07, 0.08, 0.085, 0.09, 0.10],
              terminal_growth_range: [0.015, 0.02, 0.025, 0.03],
            },
            computed_by: "uncomputed",
          };
          writeFileSync(modelPath, JSON.stringify(starter, null, 2), "utf8");
        }
        resultText = `Initialized workspace at ${dir} with valuation-model.json template.`;
      } else if (name === "verify_valuation_model") {
        const p = resolvePath(args.model_path);
        if (!existsSync(p)) throw new Error(`Model not found at: ${p}`);
        const model = JSON.parse(readFileSync(p, "utf8"));
        const v = verify(model);
        resultText = JSON.stringify(v, null, 2);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }

      sendResponse({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          content: [
            {
              type: "text",
              text: resultText
            }
          ]
        }
      });
    } catch (err) {
      sendResponse({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          content: [
            {
              type: "text",
              text: `Error executing ${name}: ${err.message}`
            }
          ],
          isError: true
        }
      });
    }
    return;
  }

  if (msg.id !== undefined) {
    sendResponse({
      jsonrpc: "2.0",
      id: msg.id,
      error: {
        code: -32601,
        message: `Method not found: ${msg.method}`
      }
    });
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg = JSON.parse(trimmed);
    handleMessage(msg);
  } catch (err) {
    // Non-JSON input ignored
  }
});
