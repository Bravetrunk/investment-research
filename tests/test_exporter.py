#!/usr/bin/env python3
import os
import sys
import tempfile
import json
import zipfile

# Add pipeline directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "pipeline")))
from exporter import build_xlsx, build_docx_from_markdown, export_ticker_folder, build_quant_sheets

print("[*] Testing pipeline/exporter.py...")

with tempfile.TemporaryDirectory() as tmpdir:
    # 1. Test build_xlsx
    test_xlsx = os.path.join(tmpdir, "test.xlsx")
    sample_sheets = {
        "Summary": [
            [{"val": "Test Title", "title": True}],
            [{"val": "Header 1", "header": True}, {"val": "Header 2", "header": True}],
            [{"val": "Row 1", "bold": True}, {"val": 123.45}],
        ]
    }
    build_xlsx(test_xlsx, sample_sheets)
    assert os.path.exists(test_xlsx), "XLSX file must exist"
    assert zipfile.is_zipfile(test_xlsx), "XLSX file must be a valid zipfile"

    # Verify sheet xml in zip
    with zipfile.ZipFile(test_xlsx, 'r') as z:
        assert '[Content_Types].xml' in z.namelist()
        assert 'xl/worksheets/sheet1.xml' in z.namelist()
    print("  [+] build_xlsx verified successfully.")

    # 2. Test build_docx_from_markdown with inline markdown formatting
    test_docx = os.path.join(tmpdir, "test.docx")
    sample_md = """# Test Title
*Disclaimer: Institutional test memo.*

## 1. Executive Summary
- **Investment Verdict**: Mandate approved with *high conviction*.
- Tracked via `pipeline/calculator.mjs` deterministic solver.

| Parameter | Metric | Context |
| --- | --- | --- |
| **Current Price** | $100.00 | *Live quote* |
| **DCF Base Target** | $150.00 | Fundamental value |
"""
    build_docx_from_markdown(test_docx, "Test Memo Title", sample_md)
    assert os.path.exists(test_docx), "DOCX file must exist"
    assert zipfile.is_zipfile(test_docx), "DOCX file must be a valid zipfile"
    with zipfile.ZipFile(test_docx, 'r') as z:
        doc_xml = z.read('word/document.xml').decode('utf-8')
        assert 'word/document.xml' in z.namelist()
        assert "**" not in doc_xml, "Raw markdown asterisks '**' must not remain in Word document"
        assert "<w:b/>" in doc_xml, "Bold tags must be generated for **bold** markdown"
        assert "<w:i/>" in doc_xml, "Italic tags must be generated for *italic* markdown"
        assert "Consolas" in doc_xml, "Code font must be generated for `code` markdown"
    print("  [+] build_docx_from_markdown verified successfully with zero raw asterisks.")

    # 3. Test export_ticker_folder with full institutional mock & separate artifact files
    ticker_dir = os.path.join(tmpdir, "CEG")
    os.makedirs(ticker_dir)
    mock_model = {
        "ticker": "CEG",
        "inputs": {
            "current_price": 294.3,
            "eps_used": 12.0,
            "eps_basis": "adjusted",
            "fcf_base": 3800.0,
            "shares_diluted": 356.5,
            "net_cash": -15841.0,
        },
        "dcf": {
            "projection_years": 5,
            "terminal_growth_rate": 0.025,
            "cases": [
                {"case": "low", "fcf_growth_rate": 0.06, "fcf_trajectory": [3200, 3500, 4200, 4600, 4900], "discount_rate": 0.085, "fair_value_per_share": 156.01, "rationale": "Base power"},
                {"case": "base", "fcf_growth_rate": 0.12, "fcf_trajectory": [4000, 4400, 5600, 6400, 7200], "discount_rate": 0.075, "fair_value_per_share": 305.23, "rationale": "Nuclear AI PPAs"},
                {"case": "high", "fcf_growth_rate": 0.16, "fcf_trajectory": [4300, 5000, 6500, 7800, 8900], "discount_rate": 0.070, "fair_value_per_share": 433.90, "rationale": "High clean power premium"}
            ]
        },
        "reverse_dcf": {
            "target_enterprise_value": 120758.95,
            "implied_growth_pct": "12.73%",
            "implied_fcf_growth_rate": 0.1273,
            "interpretation": "Balanced consensus expectations priced in."
        },
        "asymmetric_risk_reward": {
            "reward_to_risk_ratio": 0.08,
            "hurdle_verdict": "FAILS_ASYMMETRIC_HURDLE (< 3.0x or negative spread)",
            "kelly_sizing": {
                "recommended_position_pct": "0%",
                "fraction_used": "half",
                "recommendation_summary": "NO_ALLOCATION"
            }
        },
        "sotp": {
            "segments": [
                {"name": "Nuclear Generation (Fleet 24/7)", "metric_value": 3500, "multiple": 18.0, "metric_type": "EBITDA", "segment_ev": 63000, "benchmark_peer": "Clean Base Load"},
                {"name": "Calpine Gas & Merchant Fleet", "metric_value": 2200, "multiple": 8.5, "metric_type": "EBITDA", "segment_ev": 18700, "benchmark_peer": "Merchant Power"}
            ],
            "total_enterprise_value": 81700,
            "net_cash": -15841,
            "equity_value": 65859,
            "fair_value_per_share": 184.74
        }
    }
    with open(os.path.join(ticker_dir, "valuation-model.json"), "w") as f:
        json.dump(mock_model, f)

    # Add standalone forensic-report.json and ic-verdict.json
    mock_forensic = {
        "beneish_m_score": {"m_score": -2.45, "verdict": "CLEAN_LOW_MANIPULATION_RISK", "is_manipulator_probability_high": False},
        "sloan_accrual": {"accrual_pct": "-3.5%", "quality_band": "NORMAL_EARNINGS_QUALITY"},
        "sbc_dilution_ratio": "4.2%"
    }
    with open(os.path.join(ticker_dir, "forensic-report.json"), "w") as f:
        json.dump(mock_forensic, f)

    mock_verdict = {
        "conviction_tier": "High 🔥🔥🔥",
        "mandate": "APPROVED_LONG",
        "verdict": "APPROVED_LONG"
    }
    with open(os.path.join(ticker_dir, "ic-verdict.json"), "w") as f:
        json.dump(mock_verdict, f)

    result = export_ticker_folder(ticker_dir)
    assert os.path.exists(result["xlsx"]), "QUANT_ANALYSIS.xlsx must be generated"
    assert os.path.exists(result["docx"]), "RESEARCH.docx must be generated"
    assert os.path.exists(result["md"]), "RESEARCH.md must be generated"

    # Verify all 6 sheets in generated workbook
    with zipfile.ZipFile(result["xlsx"], 'r') as z:
        wb_xml = z.read("xl/workbook.xml").decode("utf-8")
        assert "Valuation Summary" in wb_xml
        assert "DCF Model" in wb_xml
        assert "Reverse DCF" in wb_xml
        assert "Sensitivity Matrix" in wb_xml
        assert "Forensic Accounting" in wb_xml
        assert "Multiples &amp; SOTP" in wb_xml or "Multiples & SOTP" in wb_xml

        # Check Tab 4 sensitivity matrix aligns with trajectory base value 305.23
        s4_xml = z.read("xl/worksheets/sheet4.xml").decode("utf-8")
        assert "305.23" in s4_xml, "Sensitivity matrix must contain base DCF fair value 305.23 matching trajectory"

        # Check Tab 1 contains IC Conviction and Kelly Sizing
        s1_xml = z.read("xl/worksheets/sheet1.xml").decode("utf-8")
        assert "High" in s1_xml or "Conviction" in s1_xml
        assert "Kelly" in s1_xml

        # Check Tab 5 contains loaded forensic report data
        s5_xml = z.read("xl/worksheets/sheet5.xml").decode("utf-8")
        assert "-2.45" in s5_xml, "Tab 5 must contain Beneish score from loaded forensic-report.json"

    print("  [+] export_ticker_folder verified with 6 tabs, sensitivity alignment, and artifact integration.")

print("[✓] ALL EXPORTER TESTS PASSED!")
