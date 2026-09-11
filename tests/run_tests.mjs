#!/usr/bin/env node
/**
 * Institutional Equity Research Test Runner
 * Zero external dependencies.
 * Discovers working Python 3 and runs all test suites sequentially.
 */

import { spawnSync } from "node:child_process";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findPythonExecutable } from "../pipeline/python-finder.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const REPO_ROOT = resolve(__dirname, "..");

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

console.log(`\n${c.bold}${c.cyan}================================================================================${c.reset}`);
console.log(` ${c.bold}🧪 RUNNING INSTITUTIONAL EQUITY RESEARCH TEST SUITES${c.reset}`);
console.log(`${c.bold}${c.cyan}================================================================================${c.reset}\n`);

const py = findPythonExecutable();
if (!py) {
  console.error(`${c.red}[✗] Fatal: Python 3.8+ is required for test execution, but no working Python interpreter was found.${c.reset}`);
  console.error(`    Please install Python 3 or export PYTHON=/path/to/python3.`);
  process.exit(1);
}

console.log(`${c.dim}[*] Detected Python interpreter:${c.reset} ${c.green}${py}${c.reset}`);
console.log(`${c.dim}[*] Detected Node version:${c.reset}       ${c.green}${process.version}${c.reset}\n`);

const suites = [
  {
    name: "Financial Calculator & Deterministic Modeling",
    cmd: "node",
    args: [join(REPO_ROOT, "tests", "test_calculator.mjs")],
  },
  {
    name: "OpenXML Exporter (DOCX & 6-Tab Excel Workbook)",
    cmd: py,
    args: [join(REPO_ROOT, "tests", "test_exporter.py")],
  },
  {
    name: "JSON Schemas Validation (22 Institutional Contracts)",
    cmd: py,
    args: [join(REPO_ROOT, "tests", "test_schemas.py")],
  },
  {
    name: "npm Package, CLI Executables & Zero-Dependency MCP Server",
    cmd: "node",
    args: [join(REPO_ROOT, "tests", "test_npm_package.mjs")],
  },
  {
    name: "OpenAI Codex / Grok Tool Dispatcher Integration",
    cmd: py,
    args: [join(REPO_ROOT, "integrations", "openai_codex_agent.py")],
  },
];

let failed = false;

for (let i = 0; i < suites.length; i++) {
  const suite = suites[i];
  console.log(`${c.bold}[${i + 1}/${suites.length}] Running suite:${c.reset} ${c.yellow}${suite.name}${c.reset}...`);
  const res = spawnSync(suite.cmd, suite.args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: { ...process.env, PYTHON: py },
  });

  if (res.error) {
    console.error(`\n${c.red}[✗] Suite failed to execute:${c.reset} ${res.error.message}`);
    failed = true;
    break;
  }

  if (res.status !== 0) {
    console.error(`\n${c.red}[✗] Suite exited with non-zero status code: ${res.status}${c.reset}`);
    failed = true;
    break;
  }

  console.log(`${c.green}[✓] Suite passed successfully.${c.reset}\n`);
}

if (failed) {
  console.error(`\n${c.bold}${c.red}================================================================================${c.reset}`);
  console.error(` ${c.bold}${c.red}TEST RUN FAILED${c.reset}`);
  console.error(`${c.bold}${c.red}================================================================================${c.reset}\n`);
  process.exit(1);
} else {
  console.log(`\n${c.bold}${c.green}================================================================================${c.reset}`);
  console.log(` ${c.bold}${c.green}✓ ALL INSTITUTIONAL RESEARCH TEST SUITES PASSED (100%)${c.reset}`);
  console.log(`${c.bold}${c.green}================================================================================${c.reset}\n`);
  process.exit(0);
}
