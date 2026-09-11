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
  sloan,
  sotp,
  evaluatePassingDiscipline,
  MASTER_THEMES,
  PASSING_DISCIPLINE_RULES,
} from "../index.js";

assert(MASTER_THEMES.length === 5, "Must expose 5 Master Theses");
assert(PASSING_DISCIPLINE_RULES.EXCESSIVE_LEVERAGE, "Must expose Passing Discipline rules");

// Test sloan both positional and object
const sloanPos = sloan(2800, 3400, 35000);
assert(sloanPos !== null && sloanPos.accrual_ratio !== undefined, "sloan positional must succeed without ReferenceError");
const sloanObj = sloan({ net_income: 2800, cfo: 3400, avg_total_assets: 35000 });
assert.strictEqual(sloanPos.accrual_pct, sloanObj.accrual_pct, "sloan positional and object results must match");

// Test sotp both positional and object
const sampleSegs = [{ name: "Core", metric_type: "ebitda", metric_value: 1000, multiple: 10 }];
const sotpPos = sotp({ segments: sampleSegs }, 100, 500);
assert(sotpPos !== null && sotpPos.fair_value_per_share === 105, "sotp positional must succeed without ReferenceError");
const sotpObj = sotp({ segments: sampleSegs, shares_diluted: 100, net_cash: 500 });
assert.strictEqual(sotpPos.fair_value_per_share, sotpObj.fair_value_per_share, "sotp positional and object results must match");

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
  const snapFile = join(tempWorkspace, "financial-snapshot.json");
  assert(existsSync(modelFile), "valuation-model.json must be created by init");
  assert(existsSync(snapFile), "financial-snapshot.json must be created by init");

  // Run calc --write
  const calcWriteRes = spawnSync("node", [cliPath, "calc", modelFile, "--write"], { encoding: "utf8" });
  assert.strictEqual(calcWriteRes.status, 0, "CLI calc --write must exit with 0");

  const writtenModel = JSON.parse(readFileSync(modelFile, "utf8"));
  assert.strictEqual(writtenModel.computed_by, "calculator", "computed_by must be set to calculator");
  assert(writtenModel.dcf.cases[1].fair_value_per_share > 0, "Base fair value must be computed");
  assert(writtenModel.sotp !== undefined && writtenModel.sotp.segments !== undefined, "Input sotp.segments must be preserved");
  assert(writtenModel.sotp_result !== undefined, "Computed sotp_result must be populated");
  assert(writtenModel.forensic !== undefined && writtenModel.forensic.beneish !== undefined, "Input forensic.beneish must be preserved");
  assert(writtenModel.forensic_result !== undefined, "Computed forensic_result must be populated");

  // Run verify via calc-cli (with flags in both positions)
  const verifyRes = spawnSync("node", [calcCliPath, modelFile, "--verify"], { encoding: "utf8" });
  assert.strictEqual(verifyRes.status, 0, "calc-cli <file> --verify must exit with 0");
  const verifyJson = JSON.parse(verifyRes.stdout);
  assert.strictEqual(verifyJson.verdict, "pass", "Verify must return pass");

  const verifyResReversed = spawnSync("node", [calcCliPath, "--verify", modelFile], { encoding: "utf8" });
  assert.strictEqual(verifyResReversed.status, 0, "calc-cli --verify <file> must exit with 0");

  // Status check
  const statusRes = spawnSync("node", [cliPath, "status", "CEG", "--dir", tempWorkspace], { encoding: "utf8" });
  assert.strictEqual(statusRes.status, 0, "CLI status must exit with 0");
  assert(statusRes.stdout.includes("AUDIT REPORT FOR WORKSPACE"));
  assert(statusRes.stdout.includes("Beneish M-Score"), "Status must report Beneish audit");

  // Test CLI export command
  const exportRes = spawnSync("node", [cliPath, "export", tempWorkspace], { encoding: "utf8" });
  assert.strictEqual(exportRes.status, 0, "CLI export must exit with 0");
  assert(existsSync(join(tempWorkspace, "QUANT_ANALYSIS.xlsx")), "QUANT_ANALYSIS.xlsx must be generated");
  assert(existsSync(join(tempWorkspace, "RESEARCH.docx")), "RESEARCH.docx must be generated");
  assert(existsSync(join(tempWorkspace, "RESEARCH.md")), "RESEARCH.md must be generated");

  console.log("  [+] CLI commands (init, calc, verify, status, export) verified successfully.");
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

  const waitForResponse = async (id, timeoutMs = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (responses.has(id)) return responses.get(id);
      await new Promise((r) => setTimeout(r, 20));
    }
    throw new Error(`Timeout waiting for MCP response ID ${id}`);
  };

  const tempMcpWorkspace = mkdtempSync(join(tmpdir(), "inv_res_mcp_"));

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

    // 3. Tool Call: init_workspace
    sendRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "init_workspace",
        arguments: { ticker: "TESTCO", target_dir: tempMcpWorkspace },
      },
    });
    const initToolResp = await waitForResponse(3);
    assert(!initToolResp.result.isError, "init_workspace must succeed");
    const mcpModelPath = join(tempMcpWorkspace, "valuation-model.json");
    assert(existsSync(mcpModelPath), "init_workspace must generate valuation-model.json");

    // 4. Tool Call: calculate_valuation (with write_back)
    sendRequest({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "calculate_valuation",
        arguments: { model_path: mcpModelPath, write_back: true },
      },
    });
    const calcResp = await waitForResponse(4);
    assert(!calcResp.result.isError, "calculate_valuation must succeed");
    const calcOutput = JSON.parse(calcResp.result.content[0].text);
    assert(calcOutput.fair_value_range.base > 0, "Base fair value must be positive");

    // 5. Tool Call: verify_valuation_model
    sendRequest({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "verify_valuation_model",
        arguments: { model_path: mcpModelPath },
      },
    });
    const verifyResp = await waitForResponse(5);
    assert(!verifyResp.result.isError);
    const verifyOut = JSON.parse(verifyResp.result.content[0].text);
    assert.strictEqual(verifyOut.verdict, "pass", "verify_valuation_model must pass on written model");

    // 6. Tool Call: solve_reverse_dcf
    sendRequest({
      jsonrpc: "2.0",
      id: 6,
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
    const revResp = await waitForResponse(6);
    assert(!revResp.result.isError);
    const revDcfResult = JSON.parse(revResp.result.content[0].text);
    assert.strictEqual(revDcfResult.current_price, 150.0);
    assert(typeof revDcfResult.implied_fcf_growth_rate === "number");

    // 7. Tool Call: calculate_sotp
    sendRequest({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "calculate_sotp",
        arguments: {
          shares_diluted: 100,
          net_cash: 200,
          segments: [{ name: "Segment A", metric_type: "ebitda", metric_value: 500, multiple: 10 }],
        },
      },
    });
    const sotpResp = await waitForResponse(7);
    assert(!sotpResp.result.isError);
    const sotpResult = JSON.parse(sotpResp.result.content[0].text);
    assert.strictEqual(sotpResult.fair_value_per_share, 52);

    // 8. Tool Call: calculate_forensic_accounting
    sendRequest({
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: {
        name: "calculate_forensic_accounting",
        arguments: {
          beneish: { dsri: 1.0, gmi: 1.0, aqi: 1.0, sgi: 1.0, depi: 1.0, sgai: 1.0, lvgi: 1.0, tata: 0.0 },
          sloan: { net_income: 1000, cfo: 1200, avg_total_assets: 10000 },
        },
      },
    });
    const forensicResp = await waitForResponse(8);
    const forensicResult = JSON.parse(forensicResp.result.content[0].text);
    assert(forensicResult.beneish.m_score < -1.78, "Beneish clean baseline must be < -1.78");
    assert(forensicResult.sloan.accrual_ratio !== undefined);

    // 9. Tool Call: evaluate_passing_discipline
    sendRequest({
      jsonrpc: "2.0",
      id: 9,
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
    const passResp = await waitForResponse(9);
    const passResult = JSON.parse(passResp.result.content[0].text);
    assert.strictEqual(passResult.verdict, "PASSED", "High debt must trigger PASSED verdict");

    // 10. Tool Call: export_research_artifacts
    sendRequest({
      jsonrpc: "2.0",
      id: 10,
      method: "tools/call",
      params: {
        name: "export_research_artifacts",
        arguments: { ticker_or_dir: tempMcpWorkspace },
      },
    });
    const exportMcpResp = await waitForResponse(10);
    assert(!exportMcpResp.result.isError, "export_research_artifacts must succeed");
    assert(existsSync(join(tempMcpWorkspace, "QUANT_ANALYSIS.xlsx")), "QUANT_ANALYSIS.xlsx must be generated by MCP export");
    assert(existsSync(join(tempMcpWorkspace, "RESEARCH.docx")), "RESEARCH.docx must be generated by MCP export");

    // 11. Error handling check: unknown tool
    sendRequest({
      jsonrpc: "2.0",
      id: 11,
      method: "tools/call",
      params: { name: "unknown_nonexistent_tool", arguments: {} },
    });
    const errResp = await waitForResponse(11);
    assert(errResp.result.isError, "Unknown tool must return isError: true");

    console.log("  [+] MCP Server JSON-RPC 2.0 stdio protocol tests passed across all 8 tools.");
  } finally {
    mcp.kill();
    if (existsSync(tempMcpWorkspace)) {
      rmSync(tempMcpWorkspace, { recursive: true, force: true });
    }
  }
}

await testMCPServer();

console.log("[✓] ALL NPM PACKAGE & CLI/MCP INTEGRATION TESTS PASSED!");
