#!/usr/bin/env python3
"""
OpenAI & xAI Grok Function Calling Integration for Investment Research.

Connects GPT-4o / Codex / Grok to the deterministic calculator and OpenXML exporter.
Zero external pip dependencies required for core logic; uses standard subprocess.
"""

import sys
import os
import json
import subprocess
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def call_calculator_cli(args):
    calc_path = REPO_ROOT / "pipeline" / "calculator.mjs"
    cmd = ["node", str(calc_path)] + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Calculator failed: {res.stderr}")
    return json.loads(res.stdout)

def call_exporter_cli(args):
    exporter_path = REPO_ROOT / "pipeline" / "exporter.py"
    cmd = ["python3", str(exporter_path)] + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout or res.stderr

def execute_tool_call(tool_name, arguments):
    """Executes an institutional tool call from OpenAI or Grok."""
    if tool_name == "solve_reverse_dcf":
        price = arguments.get("current_price")
        shares = arguments.get("shares")
        fcf = arguments.get("fcf_base")
        dr = arguments.get("discount_rate")
        tg = arguments.get("terminal_growth_rate")
        years = arguments.get("years", 5)
        net_cash = arguments.get("net_cash", 0)

        model = {
            "ticker": "TEMP",
            "computed_by": "uncomputed",
            "inputs": {
                "current_price": price,
                "shares_diluted": shares,
                "fcf_base": fcf,
                "eps_used": 10.0,
                "eps_basis": "adjusted",
                "net_cash": net_cash,
            },
            "dcf": {
                "projection_years": years,
                "terminal_growth_rate": tg,
                "cases": [
                    {"case": "low", "fcf_growth_rate": 0.04, "discount_rate": dr + 0.015, "rationale": "Bear floor"},
                    {"case": "base", "fcf_growth_rate": 0.10, "discount_rate": dr, "rationale": "Base forecast"},
                    {"case": "high", "fcf_growth_rate": 0.15, "discount_rate": max(0.01, dr - 0.01), "rationale": "Bull upside"},
                ],
            },
            "graham": {"applicability": "low_weight_asset_light"},
            "relative": {"multiples": []},
        }

        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump(model, f)
            tpath = f.name
        try:
            res = call_calculator_cli([tpath])
            return json.dumps(res.get("reverse_dcf", {}), indent=2)
        finally:
            if os.path.exists(tpath):
                os.remove(tpath)

    elif tool_name == "calculate_valuation":
        if "model_path" in arguments:
            path = os.path.expanduser(arguments["model_path"])
            flag = ["--write"] if arguments.get("write_back") else []
            res = call_calculator_cli([path] + flag)
            return json.dumps(res, indent=2)
        elif "model" in arguments:
            with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
                json.dump(arguments["model"], f)
                tpath = f.name
            try:
                res = call_calculator_cli([tpath])
                return json.dumps(res, indent=2)
            finally:
                if os.path.exists(tpath):
                    os.remove(tpath)

    elif tool_name == "export_research_artifacts":
        target = arguments.get("ticker_or_dir")
        screen = arguments.get("screen_tickers")
        if screen:
            cmd = ["--screen"] + screen
            if arguments.get("out_dir"):
                cmd += ["--out", arguments["out_dir"]]
            return call_exporter_cli(cmd)
        elif target:
            return call_exporter_cli([target])

    raise ValueError(f"Unknown tool: {tool_name}")

if __name__ == "__main__":
    print("[*] Testing OpenAI / Grok Tool Dispatcher...")
    sample_args = {
        "current_price": 150.0,
        "shares": 315.0,
        "fcf_base": 3200.0,
        "discount_rate": 0.09,
        "terminal_growth_rate": 0.025,
    }
    output = execute_tool_call("solve_reverse_dcf", sample_args)
    print("  [+] Reverse DCF output:")
    print(output)
    print("[✓] Dispatcher test successful!")
