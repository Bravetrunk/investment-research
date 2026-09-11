"""
CrewAI Tools for Institutional Equity Research.

Compatible with CrewAI agents, crews, and multi-agent DAG pipelines.
Zero pip dependencies required if subclassing or executing CLI directly.
"""

import os
import json
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any, List

REPO_ROOT = Path(__file__).resolve().parent.parent

try:
    from crewai.tools import BaseTool
except ImportError:
    # Graceful fallback when crewai is not installed in the local environment
    class BaseTool:
        name: str = ""
        description: str = ""
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def _run(self, *args, **kwargs):
            pass

def _run_node_calc(args: List[str]) -> Dict[str, Any]:
    calc_path = REPO_ROOT / "pipeline" / "calculator.mjs"
    cmd = ["node", str(calc_path)] + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Deterministic calculator failed: {res.stderr}")
    return json.loads(res.stdout)

class DeterministicValuationTool(BaseTool):
    name: str = "deterministic_valuation"
    description: str = (
        "Calculates multi-stage DCF, Reverse DCF, SOTP, Graham number, and 2D Sensitivity Matrix "
        "for a given valuation-model.json file path using zero-dependency deterministic code."
    )

    def _run(self, model_path: str, write_back: bool = True) -> str:
        path = os.path.expanduser(model_path)
        if not os.path.exists(path):
            return f"Error: model file not found at {path}"
        flags = ["--write"] if write_back else []
        try:
            res = _run_node_calc([path] + flags)
            return json.dumps(res, indent=2)
        except Exception as e:
            return f"Error during valuation calculation: {str(e)}"

class ReverseDCFTool(BaseTool):
    name: str = "reverse_dcf_solver"
    description: str = (
        "Solves for the market-implied constant FCF growth rate CAGR (g_implied) embedded in current stock price."
    )

    def _run(
        self,
        current_price: float,
        shares: float,
        fcf_base: float,
        discount_rate: float,
        terminal_growth_rate: float,
        years: int = 5,
        net_cash: float = 0.0,
    ) -> str:
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
            res = _run_node_calc([tpath])
            return json.dumps(res.get("reverse_dcf", {}), indent=2)
        finally:
            if os.path.exists(tpath):
                os.remove(tpath)

class PassingDisciplineTool(BaseTool):
    name: str = "passing_discipline_evaluator"
    description: str = (
        "Evaluates a company against institutional Investment Committee passing discipline rules "
        "(saying NO to cyclical commodity traps, excessive leverage >4.0x Net Debt/EBITDA, etc.)."
    )

    def _run(
        self,
        ticker: str,
        net_debt_to_ebitda: Optional[float] = None,
        pe_ratio: Optional[float] = None,
        archetype: Optional[str] = None,
        fcf_margin: Optional[float] = None,
        has_pricing_power: bool = True,
    ) -> str:
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

class ResearchExporterTool(BaseTool):
    name: str = "research_exporter"
    description: str = (
        "Compiles institutional research deliverables (RESEARCH.docx and QUANT_ANALYSIS.xlsx) "
        "into ~/Desktop/<TICKER>/ or runs multi-candidate screen comparison."
    )

    def _run(self, ticker_or_dir: str, screen_tickers: Optional[List[str]] = None) -> str:
        exporter_path = REPO_ROOT / "pipeline" / "exporter.py"
        if screen_tickers:
            cmd = ["python3", str(exporter_path), "--screen"] + screen_tickers
        else:
            cmd = ["python3", str(exporter_path), ticker_or_dir]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.stdout or res.stderr
