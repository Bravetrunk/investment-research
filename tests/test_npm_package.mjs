import assert from "node:assert";
import { readFileSync, existsSync, rmSync, mkdtempSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const REPO_ROOT = resolve(__dirname, "..");

console.log("[*] Testing investment-research npm package & CLI/MCP integrations...");

// ==============================================================================
// 1. Validate package.json
// ==============================================================================
const pkgPath = join(REPO_ROOT, "package.json");
assert(existsSync(pkgPath), "package.json must exist");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

assert.strictEqual(pkg.name, "investment-research", "package name must match");
assert.strictEqual(pkg.version, "1.0.0", "package version must be 1.0.0");
assert.strictEqual(pkg.type, "module", "type must be module");
assert(pkg.bin, "bin entries must be defined");
assert(pkg.bin["investment-research"], "bin.investment-research must exist");
assert(pkg.bin["investment-research-calc"], "bin.investment-research-calc must exist");
assert(pkg.bin["investment-research-mcp"], "bin.investment-research-mcp must exist");

for (const [binName, binRelPath] of Object.entries(pkg.bin)) {
  const fullBinPath = join(REPO_ROOT, binRelPath);
  assert(existsSync(fullBinPath), `Bin target for ${binName} must exist at ${binRelPath}`);
}

assert(Object.keys(pkg.dependencies || {}).length === 0, "Must maintain zero external npm dependencies");
console.log("  [+] package.json validation passed (zero external dependencies, valid bin entries).");

// ==============================================================================
// 2. Programmatic API Testing from index.js
// ==============================================================================
import {
  dcf,
  solveReverseDCF,
  computeBeneishMScore,
  computeSloanAccrual,
  computeSOTP,
  computeKellySizing,
  computeAsymmetricRiskReward,
  compute,
  verify,
  evaluatePassingDiscipline,
  MASTER_THEMES,
  PASSING_DISCIPLINE_RULES,
} from "../index.js";

assert(MASTER_THEMES.length === 5, "Must expose 5 Master Theses");
assert(PASSING_DISCIPLINE_RULES.EXCESSIVE_LEVERAGE, "Must expose Passing Discipline rules");

// Passing discipline evaluation tests
const passCheck = evaluatePassingDiscipline({
  ticker: "EQIX",
  netDebtToEbitda: 5.5,
  peRatio: 35.0,
});
assert.strictEqual(passCheck.verdict, "PASSED", "High leverage >4.0x must be PASSED");
assert(passCheck.flags.length > 0, "Must contain disqualifying flags");

const cleanCheck = evaluatePassingDiscipline({
  ticker: "VRT",
  netDebtToEbitda: 2.1,
  peRatio: 32.0,
  hasPricingPower: true,
});
assert.strictEqual(cleanCheck.verdict, "APPROVED_LONG", "Compliant ticker must be APPROVED_LONG");
console.log("  [+] Programmatic API & Passing Discipline evaluator passed.");

// ==============================================================================
// 3. CLI Execution Tests
// ==============================================================================
const cliPath = join(REPO_ROOT, "bin", "cli.js");
const calcCliPath = join(REPO_ROOT, "bin", "calc-cli.js");

// Help & Version checks
const helpRes = spawnSync("node", [cliPath, "--help"], { encoding: "utf8" });
assert.strictEqual(helpRes.status, 0, "CLI --help must exit with 0");
assert(helpRes.stdout.includes("INSTITUTIONAL MULTI-AGENT EQUITY RESEARCH"), "Help must print banner");

const calcHelpRes = spawnSync("node", [calcCliPath, "--help"], { encoding: "utf8" });
assert.strictEqual(calcHelpRes.status, 0, "calc-cli --help must exit with 0");
assert(calcHelpRes.stdout.includes("Institutional Deterministic Financial Calculator"));

// Init command in temp dir
const tempWorkspace = mkdtempSync(join(tmpdir(), "inv_res_test_"));
try {
  const initRes = spawnSync("node", [cliPath, "init", "CEG", "--dir", tempWorkspace], { encoding: "utf8" });
  assert.strictEqual(initRes.status, 0, "CLI init must exit with 0");
  const modelFile = join(tempWorkspace, "valuation-model.json");
  assert(existsSync(modelFile), "valuation-model.json must be created by init");

  // Run calc --write
  const calcWriteRes = spawnSync("node", [cliPath, "calc", modelFile, "--write"], { encoding: "utf8" });
  assert.strictEqual(calcWriteRes.status, 0, "CLI calc --write must exit with 0");

  const writtenModel = JSON.parse(readFileSync(modelFile, "utf8"));
  assert.strictEqual(writtenModel.computed_by, "calculator", "computed_by must be set to calculator");
  assert(writtenModel.dcf.cases[1].fair_value_per_share > 0, "Base fair value must be computed");

  // Run verify via calc-cli
  const verifyRes = spawnSync("node", [calcCliPath, modelFile, "--verify"], { encoding: "utf8" });
  assert.strictEqual(verifyRes.status, 0, "calc-cli --verify must exit with 0");
  const verifyJson = JSON.parse(verifyRes.stdout);
  assert.strictEqual(verifyJson.verdict, "pass", "Verify must return pass");

  // Status check
  const statusRes = spawnSync("node", [cliPath, "status", "CEG", "--dir", tempWorkspace], { encoding: "utf8" });
  assert.strictEqual(statusRes.status, 0, "CLI status must exit with 0");
  assert(statusRes.stdout.includes("AUDIT REPORT FOR WORKSPACE"));
  console.log("  [+] CLI commands (init, calc, verify, status) verified successfully.");
} finally {
  if (existsSync(tempWorkspace)) {
    rmSync(tempWorkspace, { recursive: true, force: true });
  }
}

// ==============================================================================
// 4. Model Context Protocol (MCP) Stdio Server Protocol Tests
// ==============================================================================
console.log("  [*] Testing Model Context Protocol (MCP) Server stdio protocol...");

async function testMCPServer() {
  const mcpServerPath = join(REPO_ROOT, "bin", "mcp-server.js");
  const mcp = spawn("node", [mcpServerPath], { stdio: ["pipe", "pipe", "pipe"] });

  let buffer = "";
  const responses = new Map();

  mcp.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep remainder
    for (const line of lines) {
      if (line.trim()) {
        try {
          const parsed = JSON.parse(line.trim());
          if (parsed.id !== undefined) {
            responses.set(parsed.id, parsed);
          }
        } catch (e) {}
      }
    }
  });

  const sendRequest = (req) => {
    mcp.stdin.write(JSON.stringify(req) + "\n");
  };

  const waitForResponse = async (id, timeoutMs = 3000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (responses.has(id)) return responses.get(id);
      await new Promise((r) => setTimeout(r, 20));
    }
    throw new Error(`Timeout waiting for MCP response ID ${id}`);
  };

  try {
    // 1. Handshake Initialize
    sendRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05" },
    });
    const initResp = await waitForResponse(1);
    assert.strictEqual(initResp.result.serverInfo.name, "investment-research-mcp");

    // 2. Tools List
    sendRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const listResp = await waitForResponse(2);
    assert(Array.isArray(listResp.result.tools));
    assert.strictEqual(listResp.result.tools.length, 8, "Must register exactly 8 institutional tools");

    const toolNames = listResp.result.tools.map((t) => t.name);
    assert(toolNames.includes("calculate_valuation"));
    assert(toolNames.includes("solve_reverse_dcf"));
    assert(toolNames.includes("calculate_sotp"));
    assert(toolNames.includes("calculate_forensic_accounting"));
    assert(toolNames.includes("evaluate_passing_discipline"));
    assert(toolNames.includes("export_research_artifacts"));
    assert(toolNames.includes("init_workspace"));
    assert(toolNames.includes("verify_valuation_model"));

    // 3. Tool Call: solve_reverse_dcf
    sendRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "solve_reverse_dcf",
        arguments: {
          current_price: 150.0,
          shares: 315.0,
          fcf_base: 3200.0,
          discount_rate: 0.09,
          terminal_growth_rate: 0.025,
        },
      },
    });
    const callResp = await waitForResponse(3);
    assert(!callResp.result.isError);
    const revDcfResult = JSON.parse(callResp.result.content[0].text);
    assert.strictEqual(revDcfResult.current_price, 150.0);
    assert(typeof revDcfResult.implied_fcf_growth_rate === "number");

    // 4. Tool Call: evaluate_passing_discipline (Rejection test)
    sendRequest({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "evaluate_passing_discipline",
        arguments: {
          ticker: "EQIX",
          net_debt_to_ebitda: 5.2,
          pe_ratio: 45.0,
        },
      },
    });
    const passResp = await waitForResponse(4);
    const passResult = JSON.parse(passResp.result.content[0].text);
    assert.strictEqual(passResult.verdict, "PASSED", "High debt must trigger PASSED verdict");

    // 5. Tool Call: calculate_forensic_accounting
    sendRequest({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "calculate_forensic_accounting",
        arguments: {
          beneish: { dsri: 1.0, gmi: 1.0, aqi: 1.0, sgi: 1.0, depi: 1.0, sgai: 1.0, lvgi: 1.0, tata: 0.0 },
          sloan: { net_income: 1000, cfo: 1200, avg_total_assets: 10000 },
        },
      },
    });
    const forensicResp = await waitForResponse(5);
    const forensicResult = JSON.parse(forensicResp.result.content[0].text);
    assert(forensicResult.beneish.m_score < -1.78, "Beneish clean baseline must be < -1.78");
    assert(forensicResult.sloan.accrual_ratio !== undefined);

    console.log("  [+] MCP Server JSON-RPC 2.0 stdio protocol tests passed successfully.");
  } finally {
    mcp.kill();
  }
}

await testMCPServer();

console.log("[✓] ALL NPM PACKAGE & CLI/MCP INTEGRATION TESTS PASSED!");
