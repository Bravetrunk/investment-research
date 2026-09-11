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
def export_research_documents(ticker_or_dir: str, screen_tickers: Optional[List[str]] = None) -> str:
    """Compiles publication-grade RESEARCH.docx and 6-tab QUANT_ANALYSIS.xlsx workbook."""
    exporter_path = REPO_ROOT / "pipeline" / "exporter.py"
    if screen_tickers:
        cmd = ["python3", str(exporter_path), "--screen"] + screen_tickers
    else:
        cmd = ["python3", str(exporter_path), ticker_or_dir]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout or res.stderr
