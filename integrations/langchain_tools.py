"""
LangChain & LangGraph Tool Integrations for Institutional Equity Research.

Zero mandatory dependencies; gracefully wraps functions with @tool if langchain_core is installed.
"""

import os
import json
import subprocess
from pathlib import Path
from typing import Optional, List, Dict, Any

REPO_ROOT = Path(__file__).resolve().parent.parent

try:
    from langchain_core.tools import tool
except ImportError:
    # Pass-through decorator fallback when langchain is not installed
    def tool(fn):
        fn.name = fn.__name__
        return fn

def _run_calc(args: List[str]) -> Dict[str, Any]:
    calc_path = REPO_ROOT / "pipeline" / "calculator.mjs"
    cmd = ["node", str(calc_path)] + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Calculator failed: {res.stderr}")
    return json.loads(res.stdout)

@tool
def calculate_valuation_model(model_path: str, write_back: bool = True) -> str:
    """Calculates multi-stage DCF, Reverse DCF implied growth, SOTP, and 2D Sensitivity Matrix deterministically."""
    path = os.path.expanduser(model_path)
    flags = ["--write"] if write_back else []
    try:
        res = _run_calc([path] + flags)
        return json.dumps(res, indent=2)
    except Exception as e:
        return f"Error executing valuation calculator: {e}"

@tool
def solve_reverse_dcf_growth(
    current_price: float,
    shares: float,
    fcf_base: float,
    discount_rate: float,
    terminal_growth_rate: float,
    years: int = 5,
    net_cash: float = 0.0,
) -> str:
    """Solves for the market-implied growth rate embedded in the current stock price."""
    import tempfile
    model = {
        "ticker": "TEMP",
        "computed_by": "uncomputed",
        "inputs": {
            "current_price": current_price,
            "shares_diluted": shares,
            "fcf_base": fcf_base,
            "eps_used": 10.0,
            "eps_basis": "adjusted",
            "net_cash": net_cash,
        },
        "dcf": {
            "projection_years": years,
            "terminal_growth_rate": terminal_growth_rate,
            "cases": [
                {"case": "low", "fcf_growth_rate": 0.04, "discount_rate": discount_rate + 0.015, "rationale": "Floor"},
                {"case": "base", "fcf_growth_rate": 0.10, "discount_rate": discount_rate, "rationale": "Base"},
                {"case": "high", "fcf_growth_rate": 0.15, "discount_rate": max(0.01, discount_rate - 0.01), "rationale": "Upside"},
            ],
        },
        "graham": {"applicability": "low_weight_asset_light"},
        "relative": {"multiples": []},
    }
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(model, f)
        tpath = f.name
    try:
        res = _run_calc([tpath])
        return json.dumps(res.get("reverse_dcf", {}), indent=2)
    finally:
        if os.path.exists(tpath):
            os.remove(tpath)

@tool
def calculate_forensic_accounting(
    beneish_inputs: Optional[Dict[str, float]] = None,
    net_income: Optional[float] = None,
    cfo: Optional[float] = None,
    avg_total_assets: Optional[float] = None,
) -> str:
    """Computes Beneish M-Score and Sloan Accrual Ratio to audit earnings manipulation."""
    payload = {}
    if beneish_inputs:
        payload["beneish"] = beneish_inputs
    if net_income is not None and cfo is not None and avg_total_assets is not None:
        payload["sloan"] = {"net_income": net_income, "cfo": cfo, "avg_total_assets": avg_total_assets}
    code = f"""
    import('./index.js').then(m => {{
        const res = {{}};
        const p = {json.dumps(payload)};
        if (p.beneish) res.beneish = m.beneish(p.beneish);
        if (p.sloan) res.sloan = m.sloan(p.sloan);
        console.log(JSON.stringify(res));
    }}).catch(e => {{ console.error(e); process.exit(1); }});
    """
    res = subprocess.run(["node", "--input-type=module", "-e", code], cwd=str(REPO_ROOT), capture_output=True, text=True)
    return res.stdout or res.stderr

@tool
def calculate_sotp_valuation(segments: List[Dict[str, Any]], shares_diluted: float, net_cash: float = 0.0) -> str:
    """Computes Sum-of-the-Parts enterprise value by summing segment EBITDA/revenue multiples."""
    payload = {"segments": segments, "shares_diluted": shares_diluted, "net_cash": net_cash}
    code = f"""
    import('./index.js').then(m => {{
        const res = m.sotp({json.dumps(payload)});
        console.log(JSON.stringify(res));
    }}).catch(e => {{ console.error(e); process.exit(1); }});
    """
    res = subprocess.run(["node", "--input-type=module", "-e", code], cwd=str(REPO_ROOT), capture_output=True, text=True)
    return res.stdout or res.stderr

@tool
def evaluate_passing_discipline(
    ticker: str,
    net_debt_to_ebitda: Optional[float] = None,
    pe_ratio: Optional[float] = None,
    archetype: Optional[str] = None,
    fcf_margin: Optional[float] = None,
    has_pricing_power: bool = True,
) -> str:
    """Evaluates stock against the institutional Investment Committee Passing Discipline Framework."""
    flags = []
    if net_debt_to_ebitda is not None and net_debt_to_ebitda > 4.0:
        flags.append(f"Net Debt / EBITDA ({net_debt_to_ebitda:.2f}x) > 4.0x ceiling")
    if pe_ratio is not None and pe_ratio > 50 and not has_pricing_power:
        flags.append(f"P/E {pe_ratio:.1f}x lacks pricing power")
    if fcf_margin is not None and fcf_margin < 0:
        flags.append("Negative normalized FCF margin")

    verdict = "PASSED" if flags or archetype else "APPROVED_LONG"
    return json.dumps({
        "ticker": ticker.upper(),
        "verdict": verdict,
        "passed_discipline": verdict == "PASSED",
        "flags": flags,
        "archetype_triggered": archetype
    }, indent=2)

@tool
def export_research_documents(ticker_or_dir: str, screen_tickers: Optional[List[str]] = None) -> str:
    """Compiles publication-grade RESEARCH.docx and 6-tab QUANT_ANALYSIS.xlsx workbook."""
    import sys
    exporter_path = REPO_ROOT / "pipeline" / "exporter.py"
    if screen_tickers:
        cmd = [sys.executable, str(exporter_path), "--screen"] + screen_tickers
    else:
        cmd = [sys.executable, str(exporter_path), ticker_or_dir]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout or res.stderr
