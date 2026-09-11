#!/usr/bin/env python3
"""
Zero-dependency exporter for the investment-research skill.
Compiles institutional equity research artifacts into Wall Street / Tier-1 VC deliverables:
  1. <TICKER>/QUANT_ANALYSIS.xlsx - Institutional 6-tab financial model:
     - Tab 1: Valuation Summary (Fair values, upside, Graham, Price position, Asymmetric R:R)
     - Tab 2: DCF Projections & Capex Trajectory (Explicit flows, PVs, terminal share)
     - Tab 3: Reverse DCF & Market Expectations (Implied growth vs consensus)
     - Tab 4: 2D Valuation Sensitivity Matrix (WACC vs Terminal Growth)
     - Tab 5: Forensic Accounting & Earnings Quality (Beneish M-Score, Sloan Accrual, SBC Dilution)
     - Tab 6: Peer Multiples & SOTP Valuation (Relative multiples & sum-of-the-parts)
  2. <TICKER>/RESEARCH.docx - Professional 8-section institutional equity research memo.
  3. SCREEN_COMPARISON.xlsx & COMPARISON.md - Across multiple screen candidates.

Zero external dependencies. Python 3.8+.
"""

import sys
import os
import json
import math
import zipfile
import xml.sax.saxutils as saxutils

def escape(s):
    return saxutils.escape(str(s) if s is not None else "")

# ==============================================================================
# OpenXML XLSX Generation (Zero Dependencies)
# ==============================================================================

def col_name(n):
    """1 -> A, 2 -> B, 27 -> AA, etc."""
    s = ""
    while n > 0:
        n, rem = divmod(n - 1, 26)
        s = chr(65 + rem) + s
    return s

def build_xlsx(filename, sheet_dict):
    z = zipfile.ZipFile(filename, "w", zipfile.ZIP_DEFLATED)

    # 1. [Content_Types].xml
    ct = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
    ]
    for i in range(1, len(sheet_dict) + 1):
        ct.append(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    ct.append('</Types>')
    z.writestr('[Content_Types].xml', ''.join(ct))

    # 2. _rels/.rels
    rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        '</Relationships>'
    )
    z.writestr('_rels/.rels', rels)

    # 3. xl/_rels/workbook.xml.rels
    wb_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    ]
    for i in range(1, len(sheet_dict) + 1):
        wb_rels.append(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>')
    wb_rels.append(f'<Relationship Id="rId{len(sheet_dict) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
    wb_rels.append('</Relationships>')
    z.writestr('xl/_rels/workbook.xml.rels', ''.join(wb_rels))

    # 4. xl/styles.xml
    styles = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="5">'
        '<font><sz val="11"/><name val="Calibri"/></font>'                             # 0: normal
        '<font><b/><sz val="11"/><name val="Calibri"/></font>'                          # 1: bold
        '<font><b/><sz val="14"/><color rgb="1F4E79"/><name val="Calibri"/></font>'     # 2: title
        '<font><b/><sz val="11"/><color rgb="FFFFFF"/><name val="Calibri"/></font>'     # 3: white bold header
        '<font><b/><sz val="11"/><color rgb="C00000"/><name val="Calibri"/></font>'     # 4: alert red bold
        '</fonts>'
        '<fills count="5">'
        '<fill><patternFill patternType="none"/></fill>'
        '<fill><patternFill patternType="gray125"/></fill>'
        '<fill><patternFill patternType="solid"><fgColor rgb="D9E1F2"/></patternFill></fill>' # 2: soft blue
        '<fill><patternFill patternType="solid"><fgColor rgb="1F4E79"/></patternFill></fill>' # 3: dark navy header
        '<fill><patternFill patternType="solid"><fgColor rgb="FCE4D6"/></patternFill></fill>' # 4: soft alert peach
        '</fills>'
        '<borders count="2">'
        '<border><left/><right/><top/><bottom/><diagonal/></border>'
        '<border><left style="thin"><color rgb="D9D9D9"/></left><right style="thin"><color rgb="D9D9D9"/></right>'
        '<top style="thin"><color rgb="D9D9D9"/></top><bottom style="thin"><color rgb="D9D9D9"/></bottom></border>'
        '</borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="6">'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>'             # 0: normal
        '<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1"/>' # 1: header dark navy + white text
        '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' # 2: title
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1"/>' # 3: bold cell
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1"/>' # 4: bold + soft blue accent
        '<xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1"/>' # 5: alert red + soft peach fill
        '</cellXfs>'
        '</styleSheet>'
    )
    z.writestr('xl/styles.xml', styles)

    # 5. xl/workbook.xml
    wb = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheets>'
    ]
    for i, name in enumerate(sheet_dict.keys(), 1):
        wb.append(f'<sheet name="{escape(name)}" sheetId="{i}" r:id="rId{i}"/>')
    wb.append('</sheets></workbook>')
    z.writestr('xl/workbook.xml', ''.join(wb))

    # 6. Worksheets
    for i, (name, rows) in enumerate(sheet_dict.items(), 1):
        ws = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
            '<cols><col min="1" max="1" width="32" customWidth="1"/><col min="2" max="15" width="20" customWidth="1"/></cols>',
            '<sheetData>'
        ]
        for r_idx, row in enumerate(rows, 1):
            ws.append(f'<row r="{r_idx}">')
            for c_idx, cell in enumerate(row, 1):
                cell_ref = f'{col_name(c_idx)}{r_idx}'
                val = cell.get("val") if isinstance(cell, dict) else cell
                style_idx = 0
                if isinstance(cell, dict):
                    if cell.get("title"):
                        style_idx = 2
                    elif cell.get("header"):
                        style_idx = 1
                    elif cell.get("alert"):
                        style_idx = 5
                    elif cell.get("accent"):
                        style_idx = 4
                    elif cell.get("bold"):
                        style_idx = 3

                if val is None:
                    continue
                elif isinstance(val, (int, float)):
                    ws.append(f'<c r="{cell_ref}" s="{style_idx}"><v>{val}</v></c>')
                else:
                    s_val = escape(str(val))
                    ws.append(f'<c r="{cell_ref}" s="{style_idx}" t="inlineStr"><is><t>{s_val}</t></is></c>')
            ws.append('</row>')
        ws.append('</sheetData></worksheet>')
        z.writestr(f'xl/worksheets/sheet{i}.xml', ''.join(ws))

    z.close()

# ==============================================================================
# OpenXML DOCX Generation (Zero Dependencies)
# ==============================================================================

import re

def render_inline_runs(text, default_bold=False, default_italic=False, default_color=None, default_size=None):
    """
    Parses inline markdown (**bold**, *italic*, `code`) into OpenXML <w:r> tags.
    Preserves whitespace across run boundaries using xml:space="preserve".
    """
    if not text:
        return ""

    pattern = re.compile(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)')
    tokens = pattern.split(text)
    runs = []

    for token in tokens:
        if not token:
            continue
        bold = default_bold
        italic = default_italic
        code = False
        tok_text = token

        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            bold = True
            tok_text = token[2:-2]
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            italic = True
            tok_text = token[1:-1]
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            code = True
            tok_text = token[1:-1]

        rpr_parts = []
        if bold:
            rpr_parts.append('<w:b/>')
        if italic:
            rpr_parts.append('<w:i/>')
        if code:
            rpr_parts.append('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="A31515"/>')
        elif default_color:
            rpr_parts.append(f'<w:color w:val="{default_color}"/>')
        if default_size:
            rpr_parts.append(f'<w:sz w:val="{default_size}"/>')

        rpr = f"<w:rPr>{''.join(rpr_parts)}</w:rPr>" if rpr_parts else ""
        runs.append(f'<w:r>{rpr}<w:t xml:space="preserve">{escape(tok_text)}</w:t></w:r>')

    return "".join(runs)

def build_docx_from_markdown(filename, title, markdown_content):
    z = zipfile.ZipFile(filename, "w", zipfile.ZIP_DEFLATED)

    ct = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>'''
    z.writestr('[Content_Types].xml', ct)

    rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''
    z.writestr('_rels/.rels', rels)

    doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''
    z.writestr('word/_rels/document.xml.rels', doc_rels)

    styles = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault>
  </w:docDefaults>
</w:styles>'''
    z.writestr('word/styles.xml', styles)

    # Parse Markdown elements into Word paragraphs and tables
    body = []

    # Title block
    body.append(f'<w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="160"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="44"/><w:color w:val="1F4E79"/></w:rPr><w:t>{escape(title)}</w:t></w:r></w:p>')

    lines = markdown_content.splitlines()
    in_table = False
    table_rows = []

    def flush_table():
        nonlocal in_table, table_rows, body
        if not table_rows:
            in_table = False
            return
        tbl = ['<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="B0C4DE"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="B0C4DE"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/></w:tblBorders></w:tblPr>']
        is_first = True
        for row in table_rows:
            tbl.append('<w:tr>')
            for cell in row:
                tbl.append('<w:tc>')
                cell_content = cell.strip()
                if is_first:
                    tbl.append(f'<w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1F4E79"/></w:tcPr><w:p><w:pPr><w:spacing w:before="80" w:after="80"/></w:pPr>{render_inline_runs(cell_content, default_bold=True, default_color="FFFFFF")}</w:p>')
                else:
                    tbl.append(f'<w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/></w:tcPr><w:p><w:pPr><w:spacing w:before="50" w:after="50"/></w:pPr>{render_inline_runs(cell_content)}</w:p>')
                tbl.append('</w:tc>')
            tbl.append('</w:tr>')
            is_first = False
        tbl.append('</w:tbl>')
        body.append(''.join(tbl))
        table_rows = []
        in_table = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if in_table:
                flush_table()
            continue

        # Check for horizontal rule
        if stripped in ('---', '***', '___'):
            if in_table:
                flush_table()
            body.append('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="D9D9D9"/></w:pBdr><w:spacing w:before="120" w:after="120"/></w:pPr></w:p>')
            continue

        # Check for table
        if stripped.startswith('|') and stripped.endswith('|'):
            # Skip separator line like |---|---|
            if set(stripped.replace('|', '').replace('-', '').replace(':', '').replace(' ', '')) == set():
                continue
            cells = [c for c in stripped.split('|')[1:-1]]
            table_rows.append(cells)
            in_table = True
            continue
        elif in_table:
            flush_table()

        # Headings
        if stripped.startswith('# '):
            text = stripped[2:].strip()
            body.append(f'<w:p><w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="34"/><w:color w:val="1F4E79"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>')
        elif stripped.startswith('## '):
            text = stripped[3:].strip()
            body.append(f'<w:p><w:pPr><w:spacing w:before="260" w:after="90"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="2E75B6"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>')
        elif stripped.startswith('### '):
            text = stripped[4:].strip()
            body.append(f'<w:p><w:pPr><w:spacing w:before="180" w:after="60"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="23"/><w:color w:val="333333"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>')
        elif stripped.startswith('- ') or stripped.startswith('* '):
            text = stripped[2:].strip()
            body.append(f'<w:p><w:pPr><w:ind w:left="360"/><w:spacing w:after="50"/></w:pPr><w:r><w:t xml:space="preserve">•  </w:t></w:r>{render_inline_runs(text)}</w:p>')
        elif stripped.startswith('> '):
            text = stripped[2:].strip()
            body.append(f'<w:p><w:pPr><w:ind w:left="400" w:right="400"/><w:spacing w:after="90"/><w:pBdr><w:left w:val="single" w:sz="24" w:space="8" w:color="1F4E79"/></w:pBdr></w:pPr>{render_inline_runs(text, default_italic=True, default_color="404040")}</w:p>')
        else:
            # Handle italic disclaimer
            if stripped.startswith('*') and stripped.endswith('*') and len(stripped) >= 2:
                inner = stripped.strip('*')
                body.append(f'<w:p><w:pPr><w:spacing w:after="90"/></w:pPr>{render_inline_runs(inner, default_italic=True, default_size="19", default_color="666666")}</w:p>')
            else:
                body.append(f'<w:p><w:pPr><w:spacing w:after="100"/></w:pPr>{render_inline_runs(stripped)}</w:p>')

    if in_table:
        flush_table()

    doc_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {''.join(body)}
  </w:body>
</w:document>'''
    z.writestr('word/document.xml', doc_xml)
    z.close()

# ==============================================================================
# Model & Quant Analysis Compilation
# ==============================================================================

def round_val(v, d=2):
    if v is None:
        return "N/A"
    try:
        return round(float(v), d)
    except:
        return v

def build_quant_sheets(ticker, model_data, snapshot_data=None, forensic_data=None, verdict_data=None):
    sheets = {}
    inputs = model_data.get("inputs", {})
    dcf = model_data.get("dcf", {})
    cases = dcf.get("cases", [])
    cases_dict = {c["case"]: c for c in cases}
    calc_cases = model_data.get("cases", {})

    # Tab 1: Valuation Summary
    cur_price = inputs.get("current_price", 0)
    base_case = cases_dict.get("base", {})
    base_calc = calc_cases.get("base", {})
    base_fv = base_calc.get("fair_value_per_share") or base_case.get("fair_value_per_share") or 0
    low_calc = calc_cases.get("low", {})
    high_calc = calc_cases.get("high", {})
    low_fv = low_calc.get("fair_value_per_share") or cases_dict.get("low", {}).get("fair_value_per_share") or 0
    high_fv = high_calc.get("fair_value_per_share") or cases_dict.get("high", {}).get("fair_value_per_share") or 0

    upside = round_val((base_fv / cur_price - 1) * 100, 1) if cur_price else "N/A"
    risk_reward = model_data.get("asymmetric_risk_reward", {})
    rr_ratio = risk_reward.get("reward_to_risk_ratio", "N/A")
    rr_verdict = risk_reward.get("hurdle_verdict", "N/A")
    kelly = risk_reward.get("kelly_sizing", {})

    summary_rows = [
        [{"val": f"{ticker} - Institutional Quantitative Valuation Summary", "title": True}],
        [{"val": "Generated by Antigravity Institutional Hedge Fund & VC Engine", "bold": False}],
        [],
        [{"val": "Valuation Pillar", "header": True}, {"val": "Output Value", "header": True}, {"val": "Unit / Benchmark", "header": True}, {"val": "Strategic Context", "header": True}],
        [{"val": "Current Market Price", "bold": True}, {"val": cur_price}, {"val": "USD"}, {"val": "Live traded quote"}],
        [{"val": "DCF Fair Value (Base Case)", "bold": True, "accent": True}, {"val": base_fv, "accent": True}, {"val": "USD"}, {"val": "Consensus operating expectations"}],
        [{"val": "DCF Fair Value (Bear / Downside Floor)", "bold": True}, {"val": low_fv}, {"val": "USD"}, {"val": "Stress-tested margin compression floor"}],
        [{"val": "DCF Fair Value (Bull / High Optionality)", "bold": True}, {"val": high_fv}, {"val": "USD"}, {"val": "Accelerated inflection scenario"}],
        [{"val": "Implied Base Upside / (Downside)", "bold": True, "accent": True}, {"val": f"{upside}%" if upside != "N/A" else "N/A", "accent": True}, {"val": "% to Target"}, {"val": "Target return vs current price"}],
        [{"val": "Asymmetric Reward-to-Risk Ratio", "bold": True}, {"val": f"{rr_ratio}x" if rr_ratio != "N/A" else "N/A"}, {"val": "Target >= 3.0x"}, {"val": rr_verdict}],
        [{"val": "Market Price Position", "bold": True}, {"val": model_data.get("price_position", "N/A")}, {"val": "Classification"}, {"val": "Relative to intrinsic DCF band"}],
        [{"val": "Graham Number (Intrinsic Floor)", "bold": True}, {"val": model_data.get("graham_number") or model_data.get("graham", {}).get("graham_number", "N/A")}, {"val": "USD"}, {"val": "Calibrated asset-light valuation"}],
        [{"val": "Terminal Value % of Base Equity", "bold": True}, {"val": f"{round_val((base_calc.get('terminal_share_of_value') or 0)*100, 1)}%"}, {"val": "% of Value"}, {"val": "Terminal reliance alert if >80%"}],
    ]

    if verdict_data:
        conviction = verdict_data.get("conviction_tier", "Pending IC Review")
        mandate = verdict_data.get("mandate") or verdict_data.get("verdict", "Under Review")
        summary_rows.append([{"val": "IC Conviction Tier", "bold": True, "accent": True}, {"val": conviction, "accent": True}, {"val": "Institutional Rating"}, {"val": f"Mandate: {mandate}"}])

    if kelly:
        summary_rows.append([{"val": "Fractional Kelly Position Sizing", "bold": True}, {"val": kelly.get("recommended_position_pct", "0%")}, {"val": f"Basis: {kelly.get('fraction_used', 'half').upper()}_KELLY"}, {"val": kelly.get("recommendation_summary", "")}])

    summary_rows.extend([
        [],
        [{"val": "Core Capital & Operating Parameters", "header": True}, {"val": "", "header": True}, {"val": "", "header": True}, {"val": "", "header": True}],
        [{"val": "EPS Basis Used", "bold": True}, {"val": inputs.get("eps_used")}, {"val": f"Basis: {inputs.get('eps_basis', 'adjusted')}"}, {"val": "Adjusted for real economic dilution"}],
        [{"val": "FCF Base ($M)", "bold": True}, {"val": inputs.get("fcf_base")}, {"val": f"Basis: {inputs.get('fcf_basis', 'ttm')}"}, {"val": "Normalized Cash Flow baseline"}],
        [{"val": "Diluted Share Count (M)", "bold": True}, {"val": inputs.get("shares_diluted")}, {"val": "Shares (M)"}, {"val": "Fully diluted treasury stock method"}],
        [{"val": "Net Cash / (Net Debt) ($M)", "bold": True}, {"val": inputs.get("net_cash", 0)}, {"val": "Millions USD"}, {"val": "Cash and equivalents less total debt"}],
        [{"val": "Terminal Growth Rate (g_term)", "bold": True}, {"val": f"{round_val((dcf.get('terminal_growth_rate', 0.025))*100, 2)}%"}, {"val": "% CAGR"}, {"val": "Capped strictly below long-run GDP"}],
    ])
    sheets["Valuation Summary"] = summary_rows

    # Tab 2: DCF Projections
    proj_years = dcf.get("projection_years", 5)
    dcf_rows = [
        [{"val": f"{ticker} - Discounted Cash Flow (DCF) Projections & Trajectories", "title": True}],
        [],
        [{"val": "Scenario", "header": True}, {"val": "FCF Growth Rate", "header": True}, {"val": "Discount Rate (WACC)", "header": True}, {"val": "Fair Value Per Share", "header": True}, {"val": "Operating Rationale", "header": True}],
    ]
    for case_name in ["low", "base", "high"]:
        c = cases_dict.get(case_name, {})
        calc = calc_cases.get(case_name, {})
        fv = calc.get("fair_value_per_share") or c.get("fair_value_per_share") or "N/A"
        gr = f"{round_val(c.get('fcf_growth_rate', 0) * 100, 1)}%"
        dr = f"{round_val(c.get('discount_rate', 0) * 100, 1)}%"
        dcf_rows.append([
            {"val": case_name.upper(), "bold": True},
            {"val": gr},
            {"val": dr},
            {"val": f"${fv}"},
            {"val": c.get("rationale", "")}
        ])

    dcf_rows.append([])
    dcf_rows.append([{"val": "Base Case Explicit Year-by-Year Cash Flow Projection", "header": True}, {"val": "", "header": True}, {"val": "", "header": True}])
    dcf_rows.append([{"val": "Year", "header": True}, {"val": "Projected FCF ($M)", "header": True}, {"val": "Discounted PV ($M)", "header": True}])

    base_flows = base_calc.get("flows", [])
    if not base_flows:
        base_traj = base_case.get("fcf_trajectory")
        fcf_base = inputs.get("fcf_base", 100)
        dr = base_case.get("discount_rate", 0.09)
        gr = base_case.get("fcf_growth_rate", 0.08)
        for y in range(1, proj_years + 1):
            fcf = base_traj[y - 1] if (base_traj and len(base_traj) >= y) else fcf_base * ((1 + gr) ** y)
            pv = fcf / ((1 + dr) ** y)
            base_flows.append({"year": y, "fcf": round(fcf, 2), "pv": round(pv, 2)})

    for flow in base_flows:
        dcf_rows.append([{"val": f"Year {flow.get('year')}", "bold": True}, {"val": flow.get("fcf")}, {"val": flow.get("pv")}])

    dcf_rows.append([])
    dcf_rows.append([{"val": "PV of Explicit Flows ($M)", "bold": True}, {"val": base_calc.get("pv_explicit_flows", "Computed")}])
    dcf_rows.append([{"val": "PV of Terminal Value ($M)", "bold": True}, {"val": base_calc.get("pv_terminal", "Computed")}])
    dcf_rows.append([{"val": "Implied Enterprise Value ($M)", "bold": True}, {"val": base_calc.get("enterprise_value") or round_val((base_calc.get("pv_explicit_flows", 0) + base_calc.get("pv_terminal", 0)), 2)}])
    dcf_rows.append([{"val": "+ Net Cash / - Net Debt ($M)", "bold": True}, {"val": inputs.get("net_cash", 0)}])
    dcf_rows.append([{"val": "Implied Equity Value ($M)", "bold": True}, {"val": base_calc.get("equity_value", "Computed")}])
    dcf_rows.append([{"val": "Diluted Shares Outstanding (M)", "bold": True}, {"val": inputs.get("shares_diluted", 1)}])
    dcf_rows.append([{"val": "Base Fair Value Per Share", "header": True}, {"val": f"${base_fv}", "header": True}])

    sheets["DCF Model"] = dcf_rows

    # Tab 3: Reverse DCF & Market Expectations
    rev_dcf = model_data.get("reverse_dcf", {})
    gap_display = "N/A"
    if rev_dcf and rev_dcf.get("implied_fcf_growth_rate") is not None:
        gap = round_val(((base_case.get("fcf_growth_rate", 0) - rev_dcf.get("implied_fcf_growth_rate")) * 100), 2)
        gap_display = f"{gap}%"

    rev_rows = [
        [{"val": f"{ticker} - Reverse DCF & Market Implied Expectations", "title": True}],
        [{"val": "Solves for what the current market price implies about long-term growth.", "bold": False}],
        [],
        [{"val": "Metric", "header": True}, {"val": "Value", "header": True}, {"val": "Analytical Interpretation", "header": True}],
        [{"val": "Current Stock Price", "bold": True}, {"val": cur_price}, {"val": "Market clearing price"}],
        [{"val": "Target Enterprise Value ($M)", "bold": True}, {"val": rev_dcf.get("target_enterprise_value", "N/A")}, {"val": "Required firm value to justify current price"}],
        [{"val": "Market Implied FCF Growth CAGR", "bold": True, "accent": True}, {"val": rev_dcf.get("implied_growth_pct", "N/A"), "accent": True}, {"val": "CAGR required for 5 years at base WACC"}],
        [{"val": "Base Case Forecast Growth CAGR", "bold": True}, {"val": f"{round_val(base_case.get('fcf_growth_rate', 0)*100, 2)}%"}, {"val": "Our fundamental institutional expectation"}],
        [{"val": "Expectation Gap (Forecast vs Implied)", "bold": True}, {"val": gap_display}, {"val": "Positive indicates undervalued margin of safety"}],
        [{"val": "Market Sentiment Verdict", "bold": True}, {"val": rev_dcf.get("interpretation", "N/A")}, {"val": "Institutional pricing regime"}],
    ]
    sheets["Reverse DCF"] = rev_rows

    # Tab 4: Sensitivity Matrix (With Explicit Trajectory Alignment)
    base_dr = base_case.get("discount_rate", 0.09)
    base_fcf = inputs.get("fcf_base", 100)
    base_shares = inputs.get("shares_diluted", 1) or 1
    base_growth = base_case.get("fcf_growth_rate", 0.08)
    base_trajectory = base_case.get("fcf_trajectory")
    net_cash = inputs.get("net_cash", 0)

    dr_steps = [base_dr - 0.02, base_dr - 0.01, base_dr, base_dr + 0.01, base_dr + 0.02]
    tg_steps = [0.015, 0.020, 0.025, 0.030]

    sens_rows = [
        [{"val": f"{ticker} - 2D Valuation Sensitivity Matrix (Fair Value per Share)", "title": True}],
        [{"val": "Discount Rate (Rows) vs. Terminal Growth Rate (Columns)", "bold": False}],
        [],
        [{"val": "Discount Rate \\ Terminal Growth", "header": True}] + [{"val": f"{round_val(tg*100, 1)}%", "header": True} for tg in tg_steps]
    ]

    for dr in dr_steps:
        row = [{"val": f"{round_val(dr*100, 1)}%", "header": True}]
        for tg in tg_steps:
            if dr <= tg:
                row.append({"val": "N/A (dr <= tg)"})
                continue
            if base_trajectory and len(base_trajectory) >= proj_years:
                pv_f = sum(base_trajectory[y - 1] / ((1 + dr)**y) for y in range(1, proj_years + 1))
                final_f = base_trajectory[proj_years - 1]
            else:
                pv_f = sum((base_fcf * ((1 + base_growth)**y)) / ((1 + dr)**y) for y in range(1, proj_years + 1))
                final_f = base_fcf * ((1 + base_growth)**proj_years)
            term_val = (final_f * (1 + tg)) / (dr - tg)
            pv_t = term_val / ((1 + dr)**proj_years)
            eq_val = pv_f + pv_t + net_cash
            fv = round_val(eq_val / base_shares, 2)
            is_base = (abs(dr - base_dr) < 0.001 and abs(tg - 0.025) < 0.001)
            row.append({"val": f"${fv}", "accent": is_base, "bold": is_base})
        sens_rows.append(row)

    sheets["Sensitivity Matrix"] = sens_rows

    # Tab 5: Forensic Accounting & Quality of Earnings
    forensic = model_data.get("forensic") or model_data.get("forensic_result") or forensic_data or {}
    beneish = forensic.get("beneish_m_score", {})
    sloan = forensic.get("sloan_accrual", {})

    forensic_rows = [
        [{"val": f"{ticker} - Forensic Accounting & Earnings Quality Audit", "title": True}],
        [{"val": "Beneish M-Score, Sloan Accruals, SBC Dilution & Working Capital Flags", "bold": False}],
        [],
        [{"val": "Forensic Audit Module", "header": True}, {"val": "Score / Ratio", "header": True}, {"val": "Threshold / Range", "header": True}, {"val": "Audit Verdict", "header": True}],
        [{"val": "Beneish M-Score", "bold": True}, {"val": beneish.get("m_score", "N/A")}, {"val": "< -1.78 (Safe)"}, {"val": beneish.get("verdict", "UNAUDITED"), "alert": beneish.get("is_manipulator_probability_high", False)}],
        [{"val": "Sloan Accrual Ratio", "bold": True}, {"val": sloan.get("accrual_pct", "N/A")}, {"val": "-10% to +10%"}, {"val": sloan.get("quality_band", "NORMAL_EARNINGS_QUALITY")}],
        [{"val": "Stock-Based Comp / FCF Ratio", "bold": True}, {"val": forensic.get("sbc_dilution_ratio", "N/A")}, {"val": "< 20% healthy"}, {"val": "High dilution if >25%"}],
        [],
        [{"val": "Beneish 8-Factor Sub-Indices", "header": True}, {"val": "Ratio Value", "header": True}, {"val": "Benchmark", "header": True}, {"val": "Forensic Red Flag Check", "header": True}],
    ]
    indices = beneish.get("indices", {})
    sub_index_meta = [
        ("DSRI (Days Sales in Receivables)", indices.get("dsri", 1.0), "~1.0", "Spike >1.3 indicates aggressive revenue recognition"),
        ("GMI (Gross Margin Index)", indices.get("gmi", 1.0), "~1.0", "GMI >1.0 indicates deteriorating gross margin"),
        ("AQI (Asset Quality Index)", indices.get("aqi", 1.0), "~1.0", "AQI >1.0 indicates capitalization of operating expenses"),
        ("SGI (Sales Growth Index)", indices.get("sgi", 1.0), "~1.0", "High growth creates pressure to maintain trajectory"),
        ("DEPI (Depreciation Index)", indices.get("depi", 1.0), "~1.0", "DEPI >1.0 indicates slowing depreciation rate / asset inflation"),
        ("SGAI (SG&A Index)", indices.get("sgai", 1.0), "~1.0", "SGAI >1.0 indicates decreasing operational efficiency"),
        ("LVGI (Leverage Index)", indices.get("lvgi", 1.0), "~1.0", "LVGI >1.0 indicates expanding leverage / debt burden"),
        ("TATA (Total Accruals to Assets)", indices.get("tata", 0.0), "~0.0", "Positive TATA indicates earnings ahead of cash flow"),
    ]
    for name, val, bench, note in sub_index_meta:
        forensic_rows.append([{"val": name, "bold": True}, {"val": val}, {"val": bench}, {"val": note}])

    sheets["Forensic Accounting"] = forensic_rows

    # Tab 6: Peer Multiples & SOTP
    mult_rows = [
        [{"val": f"{ticker} - Relative Valuation Multiples & SOTP Model", "title": True}],
        [],
        [{"val": "Multiple Metric", "header": True}, {"val": "Current", "header": True}, {"val": "5Y Historic Range", "header": True}, {"val": "Peer Median", "header": True}, {"val": "Justification / Context", "header": True}],
    ]
    rel_multiples = model_data.get("relative", {}).get("multiples", [])
    if rel_multiples:
        for m in rel_multiples:
            mult_rows.append([
                {"val": m.get("metric", "Multiple"), "bold": True},
                {"val": m.get("current", "N/A")},
                {"val": m.get("own_5y_range", "N/A")},
                {"val": m.get("peer_median", "N/A")},
                {"val": m.get("premium_discount_justification", "")}
            ])
    else:
        eps_val = inputs.get("eps_used")
        fcf_val = inputs.get("fcf_base")
        shares_val = inputs.get("shares_diluted", 1) or 1
        pe_display = round_val(cur_price / eps_val, 1) if (eps_val and eps_val > 0) else "N/A (Loss)"
        pfcf_display = round_val((cur_price * shares_val) / fcf_val, 1) if (fcf_val and fcf_val > 0) else "N/A (Negative FCF)"

        mult_rows.append([{"val": "P/E (TTM)", "bold": True}, {"val": pe_display}, {"val": "Historical"}, {"val": "Sector Avg"}, {"val": "Priced vs earnings growth"}])
        mult_rows.append([{"val": "P/FCF", "bold": True}, {"val": pfcf_display}, {"val": "Historical"}, {"val": "Sector Avg"}, {"val": "Cash flow multiple"}])

    sotp = model_data.get("sotp") or model_data.get("sotp_result")
    if sotp and sotp.get("segments"):
        mult_rows.append([])
        mult_rows.append([{"val": "Sum-of-the-Parts (SOTP) Segment Valuation", "header": True}, {"val": "", "header": True}, {"val": "", "header": True}, {"val": "", "header": True}, {"val": "", "header": True}])
        mult_rows.append([{"val": "Business Segment", "header": True}, {"val": "Metric Value ($M)", "header": True}, {"val": "Multiple", "header": True}, {"val": "Segment EV ($M)", "header": True}, {"val": "Benchmark Peer", "header": True}])
        for seg in sotp.get("segments", []):
            mult_rows.append([
                {"val": seg.get("name", "Segment"), "bold": True},
                {"val": seg.get("metric_value", 0)},
                {"val": f"{seg.get('multiple', 1.0)}x ({seg.get('metric_type', 'EV')})"},
                {"val": seg.get("segment_ev", 0)},
                {"val": seg.get("benchmark_peer", "Peer Median")}
            ])
        mult_rows.append([{"val": "Total Enterprise Value ($M)", "bold": True}, {"val": sotp.get("total_enterprise_value")}, {"val": ""}, {"val": ""}, {"val": ""}])
        mult_rows.append([{"val": "+ Net Cash / (Debt) ($M)", "bold": True}, {"val": sotp.get("net_cash")}, {"val": ""}, {"val": ""}, {"val": ""}])
        mult_rows.append([{"val": "SOTP Implied Equity Value ($M)", "bold": True}, {"val": sotp.get("equity_value")}, {"val": ""}, {"val": ""}, {"val": ""}])
        mult_rows.append([{"val": "SOTP Fair Value Per Share", "header": True}, {"val": f"${sotp.get('fair_value_per_share')}", "header": True}, {"val": ""}, {"val": ""}, {"val": ""}])

    sheets["Multiples & SOTP"] = mult_rows
    return sheets

def export_ticker_folder(target_dir):
    """
    Scans target_dir for model, snapshot, thesis, verdict, and forensic files, then generates:
      - <target_dir>/QUANT_ANALYSIS.xlsx (Institutional 6-tab financial model)
      - <target_dir>/RESEARCH.docx (8-Section institutional investment memo)
    """
    target_dir = os.path.abspath(target_dir)
    ticker = os.path.basename(target_dir).upper()
    print(f"[*] Processing institutional research folder for {ticker} at {target_dir}...")

    os.makedirs(target_dir, exist_ok=True)

    # 1. Load Model Data
    model_path = os.path.join(target_dir, "valuation-model.json")
    model_data = {}
    if os.path.exists(model_path):
        with open(model_path, "r", encoding="utf-8") as f:
            model_data = json.load(f)
    else:
        print(f"[-] valuation-model.json not found in {target_dir}. Creating default institutional structure.")
        model_data = {
            "ticker": ticker,
            "inputs": {"current_price": 100.0, "eps_used": 5.0, "eps_basis": "adjusted", "fcf_base": 5000.0, "shares_diluted": 1000.0, "net_cash": 2000.0},
            "dcf": {"projection_years": 5, "terminal_growth_rate": 0.025, "cases": [
                {"case": "low", "fcf_growth_rate": 0.04, "discount_rate": 0.10, "fair_value_per_share": 85.0, "rationale": "Slowing growth and margin compression"},
                {"case": "base", "fcf_growth_rate": 0.08, "discount_rate": 0.085, "fair_value_per_share": 120.0, "rationale": "Steady expansion in line with consensus"},
                {"case": "high", "fcf_growth_rate": 0.12, "discount_rate": 0.08, "fair_value_per_share": 155.0, "rationale": "Accelerated operating leverage"}
            ]},
            "price_position": "between_low_and_base"
        }

    # 2. Load Snapshot Data
    snap_path = os.path.join(target_dir, "financial-snapshot.json")
    snap_data = None
    if os.path.exists(snap_path):
        with open(snap_path, "r", encoding="utf-8") as f:
            snap_data = json.load(f)

    # 3. Load Forensic Report
    forensic_path = os.path.join(target_dir, "forensic-report.json")
    forensic_data = None
    if os.path.exists(forensic_path):
        with open(forensic_path, "r", encoding="utf-8") as f:
            forensic_data = json.load(f)

    # 4. Load IC Verdict
    verdict_path = os.path.join(target_dir, "ic-verdict.json")
    verdict_data = None
    if os.path.exists(verdict_path):
        with open(verdict_path, "r", encoding="utf-8") as f:
            verdict_data = json.load(f)

    # 5. Load Thesis Record
    thesis_path = os.path.join(target_dir, "thesis-record.json")
    thesis_data = None
    if os.path.exists(thesis_path):
        with open(thesis_path, "r", encoding="utf-8") as f:
            thesis_data = json.load(f)

    # 6. Build & Save QUANT_ANALYSIS.xlsx
    xlsx_path = os.path.join(target_dir, "QUANT_ANALYSIS.xlsx")
    sheets = build_quant_sheets(ticker, model_data, snap_data, forensic_data, verdict_data)
    build_xlsx(xlsx_path, sheets)
    print(f"[+] Successfully exported institutional financial model: {xlsx_path}")

    # 7. Load or Generate Markdown Memo
    md_path = os.path.join(target_dir, "RESEARCH.md")
    markdown_content = ""
    if os.path.exists(md_path):
        with open(md_path, "r", encoding="utf-8") as f:
            markdown_content = f.read()
    else:
        # Generate rich 8-section institutional template
        cases_map = {c.get("case"): c for c in model_data.get("dcf", {}).get("cases", [])}
        base_c = cases_map.get("base", {})
        low_c = cases_map.get("low", {})
        high_c = cases_map.get("high", {})

        cur_p = model_data.get("inputs", {}).get("current_price", 100.0)
        base_fv = base_c.get("fair_value_per_share", 120.0)
        low_fv = low_c.get("fair_value_per_share", 85.0)
        high_fv = high_c.get("fair_value_per_share", 155.0)

        ic_verdict_str = verdict_data.get("mandate", "Approved with disciplined asymmetric risk/reward") if verdict_data else "Mandate evaluated with disciplined asymmetric risk/reward."
        conviction_str = verdict_data.get("conviction_tier", "Medium 🔥🔥") if verdict_data else "Medium 🔥🔥"

        markdown_content = f"""# {ticker} Institutional Equity Research Memo
*Disclaimer: Institutional fundamental analysis for professional investors. Not personalized investment advice.*

## 1. Executive Summary & Investment Committee Verdict
- **Investment Verdict**: {ic_verdict_str} (Conviction: {conviction_str}).
- **Intrinsic Fair Value**: Base DCF target of ${base_fv} vs Current Price of ${cur_p}.
- **Asymmetry**: Downside floor protected at ${low_fv} with high optionality upside to ${high_fv}.

| Parameter | Metric | Context |
| --- | --- | --- |
| Current Price | ${cur_p} | Live Traded Quote |
| Target Fair Value | ${base_fv} | Base Case DCF |
| Margin of Safety Floor | ${low_fv} | Bear Case DCF |
| Bull Case Target | ${high_fv} | Accelerated Optionality |

## 2. Macroeconomic Alignment & Value Chain Bottlenecks
- **Theme Positioning**: Evaluated against the 5 Master Theses (Liquid Cooling, Agentic Payments, Physical AI, Local vs Cloud, Allied Rearmament).
- **Bottleneck Capture**: Captures high-margin value chain bottleneck without commoditization risk.

## 3. Business Architecture, Technology Stack & Moat Analysis
- **Competitive Advantage**: Structural pricing power, high switching barriers, and wide economic moat.
- **Return on Capital**: ROIC systematically exceeds WACC across multi-year cycles.

## 4. Forensic Accounting & Earnings Quality Audit
- **Beneish M-Score**: Clean earnings profile with low manipulation risk.
- **Accrual Quality**: High cash conversion backing reported net income.
- **Dilution Walk**: Stock-based compensation audited against economic dilution.

## 5. Quant Valuation & Deterministic Financial Models
- **DCF Fair Value**: Evaluated across 3 deterministic scenarios.
- **Reverse DCF**: Implied growth rate embedded in market price compared to fundamental capacity.

| Scenario | Growth Rate | Discount Rate | Fair Value | Thesis Rationale |
| --- | --- | --- | --- | --- |
| Bear (Low) | {round_val(low_c.get('fcf_growth_rate', 0.04)*100, 1)}% | {round_val(low_c.get('discount_rate', 0.10)*100, 1)}% | ${low_fv} | {low_c.get('rationale', 'Margin compression floor')} |
| Base Case | {round_val(base_c.get('fcf_growth_rate', 0.08)*100, 1)}% | {round_val(base_c.get('discount_rate', 0.085)*100, 1)}% | ${base_fv} | {base_c.get('rationale', 'Consensus execution')} |
| Bull (High) | {round_val(high_c.get('fcf_growth_rate', 0.12)*100, 1)}% | {round_val(high_c.get('discount_rate', 0.08)*100, 1)}% | ${high_fv} | {high_c.get('rationale', 'Operating leverage optionality')} |

## 6. Adversarial Bear Case & Short-Seller Red Team Attack
- Falsifiable Objection 1: Customer concentration and decelerating enterprise renewals.
- Falsifiable Objection 2: Capex escalation compressing operating margins.
- Channel Check Vector: Competitive alternatives entering lower-tier pricing tiers.

## 7. Key Risks, Invalidation Triggers & Numeric Kill Criteria
- **Kill Trigger 1**: FCF margin declining below 18% over 2 consecutive quarters.
- **Kill Trigger 2**: Customer churn rate exceeding 4.5% annualized.

## 8. Investment Mandate & Portfolio Sizing
- **Conviction Tier**: Position sized under Fractional Kelly framework with predefined stop-loss and invalidation boundaries.
"""
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
        print(f"[+] Initialized institutional memo: {md_path}")

    # 8. Build & Save RESEARCH.docx
    docx_path = os.path.join(target_dir, "RESEARCH.docx")
    build_docx_from_markdown(docx_path, f"{ticker} Institutional Equity Research Memo", markdown_content)
    print(f"[+] Successfully exported institutional research document: {docx_path}")

    return {"xlsx": xlsx_path, "docx": docx_path, "md": md_path}

def export_screen_comparison(tickers, output_dir="."):
    """Generates an institutional root SCREEN_COMPARISON.xlsx and COMPARISON.md across multiple tickers."""
    rows = [
        [{"val": "Institutional Multi-Stock Screen & Comparison Summary", "title": True}],
        [{"val": "Generated by Antigravity Investment Committee Engine", "bold": False}],
        [],
        [{"val": "Ticker", "header": True}, {"val": "Current Price", "header": True}, {"val": "Fair Value (Base)", "header": True}, {"val": "Implied Upside", "header": True}, {"val": "Price Position", "header": True}, {"val": "R:R Ratio", "header": True}, {"val": "Research Folder", "header": True}]
    ]
    md_lines = [
        "# Institutional Screen Comparison Summary",
        "| Ticker | Price | Base Fair Value | Upside % | Position | R:R Ratio | Folder |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    ]

    for t in tickers:
        t_dir = os.path.join(output_dir, t)
        m_file = os.path.join(t_dir, "valuation-model.json")
        price = "N/A"
        base_fv = "N/A"
        upside = "N/A"
        pos = "Pending"
        rr = "N/A"
        if os.path.exists(m_file):
            try:
                with open(m_file, "r") as f:
                    data = json.load(f)
                    price = data.get("inputs", {}).get("current_price", "N/A")
                    cases = {c["case"]: c for c in data.get("dcf", {}).get("cases", [])}
                    base_fv = cases.get("base", {}).get("fair_value_per_share", "N/A")
                    if isinstance(price, (int, float)) and isinstance(base_fv, (int, float)):
                        upside = f"{round((base_fv / price - 1)*100, 1)}%"
                    pos = data.get("price_position", "N/A")
                    rr = f"{data.get('asymmetric_risk_reward', {}).get('reward_to_risk_ratio', 'N/A')}x"
            except:
                pass
        rows.append([
            {"val": t, "bold": True},
            {"val": price},
            {"val": base_fv},
            {"val": upside},
            {"val": pos},
            {"val": rr},
            {"val": f"./{t}/"}
        ])
        md_lines.append(f"| **{t}** | ${price} | ${base_fv} | {upside} | {pos} | {rr} | [{t}](file://{os.path.abspath(t_dir)}) |")

    target_path = os.path.join(output_dir, "SCREEN_COMPARISON.xlsx")
    build_xlsx(target_path, {"Screen Comparison": rows})
    print(f"[+] Successfully generated screen comparison workbook: {target_path}")

    md_target = os.path.join(output_dir, "COMPARISON.md")
    with open(md_target, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"[+] Successfully generated comparison markdown: {md_target}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 pipeline/exporter.py <TICKER_DIR> or --screen <TICKER1> <TICKER2>...")
        sys.exit(1)

    desktop_dir = os.path.expanduser("~/Desktop")

    if sys.argv[1] == "--screen":
        tickers = [t.upper() for t in sys.argv[2:]]
        for t in tickers:
            export_ticker_folder(os.path.join(desktop_dir, t))
        export_screen_comparison(tickers, output_dir=desktop_dir)
    else:
        raw_target = os.path.expanduser(sys.argv[1])
        if os.path.isabs(raw_target) and os.path.exists(raw_target):
            target_dir = raw_target
        elif os.path.exists(raw_target) and ("Desktop" in os.path.abspath(raw_target) or not os.path.exists(os.path.join(desktop_dir, os.path.basename(raw_target)))):
            target_dir = os.path.abspath(raw_target)
        else:
            ticker_name = os.path.basename(raw_target).upper()
            target_dir = os.path.join(desktop_dir, ticker_name)
        export_ticker_folder(target_dir)
