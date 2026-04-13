#!/usr/bin/env python3
"""Generate Capstone Model Tour Checklist PDF"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    ListFlowable,
    ListItem,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

DARK_NAVY = HexColor("#1a2744")
ACCENT_BLUE = HexColor("#3b5998")
LIGHT_GRAY = HexColor("#f5f5f5")
MID_GRAY = HexColor("#666666")
GREEN = HexColor("#2d6a4f")

doc = SimpleDocTemplate(
    "/Users/daniel.bodanske/Desktop/bus-math-v2/public/pdfs/capstone_model_tour_checklist.pdf",
    pagesize=letter,
    rightMargin=0.75 * inch,
    leftMargin=0.75 * inch,
    topMargin=0.75 * inch,
    bottomMargin=0.75 * inch,
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "Title",
    parent=styles["Heading1"],
    fontSize=28,
    textColor=DARK_NAVY,
    spaceAfter=20,
    alignment=TA_CENTER,
    fontName="Helvetica-Bold",
)
subtitle_style = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontSize=12,
    textColor=MID_GRAY,
    spaceAfter=30,
    alignment=TA_CENTER,
)
section_header = ParagraphStyle(
    "Section",
    parent=styles["Heading2"],
    fontSize=16,
    textColor=DARK_NAVY,
    spaceBefore=18,
    spaceAfter=10,
    fontName="Helvetica-Bold",
)
subsection = ParagraphStyle(
    "Subsection",
    parent=styles["Heading3"],
    fontSize=13,
    textColor=ACCENT_BLUE,
    spaceBefore=12,
    spaceAfter=6,
    fontName="Helvetica-Bold",
)
body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontSize=10,
    textColor="#333333",
    spaceAfter=6,
    alignment=TA_LEFT,
    fontName="Helvetica",
    leading=13,
)
checklist_style = ParagraphStyle(
    "Check",
    parent=styles["Normal"],
    fontSize=10,
    textColor="#333333",
    spaceAfter=4,
    leftIndent=10,
    fontName="Helvetica",
    leading=13,
)
note_style = ParagraphStyle(
    "Note",
    parent=styles["Normal"],
    fontSize=9,
    textColor=MID_GRAY,
    spaceAfter=8,
    leftIndent=20,
    fontName="Helvetica-Oblique",
    leading=12,
)

content = []

# Cover
content.append(Spacer(1, 1.5 * inch))
content.append(Paragraph("FINANCIAL MODEL", title_style))
content.append(Spacer(1, 0.2 * inch))
content.append(Paragraph("Tour Checklist", subtitle_style))
content.append(Spacer(1, 1 * inch))
content.append(
    Paragraph(
        "TechStart Capstone",
        ParagraphStyle(
            "Center",
            parent=body_style,
            alignment=TA_CENTER,
            textColor=ACCENT_BLUE,
            fontName="Helvetica-Bold",
        ),
    )
)
content.append(Spacer(1, 0.5 * inch))
content.append(
    Paragraph(
        "Use this checklist during your investor pitch to ensure your financial model presentation covers all critical components. Each section represents a tab in your TechStart workbook.",
        ParagraphStyle(
            "Center", parent=body_style, alignment=TA_CENTER, textColor=MID_GRAY
        ),
    )
)
content.append(Spacer(1, 1.5 * inch))
content.append(PageBreak())

# Section 1: Statement Tab
content.append(Paragraph("1. STATEMENT TAB VERIFICATION", section_header))
content.append(
    Paragraph("Verify your financial statements are properly linked:", body_style)
)
content.append(Spacer(1, 0.1 * inch))

stmt_checks = [
    ("Income Statement loads from Operations tab", "☐", "Check: Net income matches"),
    ("Balance Sheet balances (A = L + E)", "☐", "Error flag should be '0' or blank"),
    (
        "Cash Flow reconciles to balance sheet",
        "☐",
        "Ending cash = Cash on Balance Sheet",
    ),
    (
        "All statements reference single Assumptions section",
        "☐",
        "No hard-coded values in statement cells",
    ),
]
for item, box, note in stmt_checks:
    content.append(Paragraph(f"{box}  {item}", checklist_style))
    content.append(Paragraph(note, note_style))

content.append(Paragraph("Common Errors to Avoid:", subsection))
for err in [
    "Circular references (Income Tax expense referencing net income)",
    "Hard-coded subtotals instead of SUM formulas",
    "Balance sheet not balancing (A ≠ L + E)",
    "Cash flow from operations not matching actual changes",
]:
    content.append(Paragraph(f"• {err}", checklist_style))
content.append(PageBreak())

# Section 2: Operations Tab
content.append(Paragraph("2. OPERATIONS TAB VERIFICATION", section_header))
content.append(
    Paragraph("Confirm your operating projections are realistic:", body_style)
)
content.append(Spacer(1, 0.1 * inch))

ops_checks = [
    (
        "Revenue build starts from customer acquisition assumptions",
        "☐",
        "Check: Headcount × productivity × price",
    ),
    (
        "COGS varies with revenue (variable cost structure)",
        "☐",
        "Check: % of revenue matches assumption",
    ),
    (
        "Operating expenses split into fixed and variable",
        "☐",
        "Check: Rent, salaries as fixed; supplies as variable",
    ),
    (
        "Seasonal adjustments applied (if applicable)",
        "☐",
        "Check: Monthly variation reflects business cycle",
    ),
    (
        "Working capital items (AR, Inventory, AP) link to revenue",
        "☐",
        "Check: Days sales outstanding consistent",
    ),
]
for item, box, note in ops_checks:
    content.append(Paragraph(f"{box}  {item}", checklist_style))
    content.append(Paragraph(note, note_style))

content.append(Paragraph("Assumption Documentation:", subsection))
for doc_item in [
    "Pricing strategy with justification",
    "Customer acquisition cost and conversion rate",
    "Churn rate and revenue retention",
    "Gross margin by product/service line",
    "Operating expense scaling factors",
]:
    content.append(Paragraph(f"• {doc_item}", checklist_style))
content.append(PageBreak())

# Section 3: Financing Tab
content.append(Paragraph("3. FINANCING TAB VERIFICATION", section_header))
content.append(
    Paragraph("Review your capital structure and investor returns:", body_style)
)
content.append(Spacer(1, 0.1 * inch))

fin_checks = [
    (
        "Debt schedule shows all financing rounds",
        "☐",
        "Check: Round 1, 2, 3 (if applicable)",
    ),
    (
        "Interest expense calculated on average balance",
        "☐",
        "Check: Rate × (Beginning + Ending)/2",
    ),
    (
        "Equity dilution table is complete",
        "☐",
        "Check: Pre/post money valuation × shares",
    ),
    (
        "IRR calculation reflects investor perspective",
        "☐",
        "Check: Cash in vs cash out timing",
    ),
    (
        "Scenario toggles (base/optimistic/conservative) work",
        "☐",
        "Check: All three scenarios balance",
    ),
]
for item, box, note in fin_checks:
    content.append(Paragraph(f"{box}  {item}", checklist_style))
    content.append(Paragraph(note, note_style))

content.append(Paragraph("Investor Return Metrics to Highlight:", subsection))
for metric in [
    "Payback period (when investor recovers investment)",
    "MOIC (Multiple on Invested Capital)",
    "IRR (Internal Rate of Return)",
    "Exit multiple assumption and timeline",
]:
    content.append(Paragraph(f"• {metric}", checklist_style))
content.append(PageBreak())

# Section 4: Formatting & Presentation
content.append(Paragraph("4. FORMATTING & PRESENTATION STANDARDS", section_header))
content.append(
    Paragraph(
        "Ensure your workbook meets professional presentation standards:", body_style
    )
)
content.append(Spacer(1, 0.1 * inch))

fmt_checks = [
    (
        "Tab names are descriptive and consistent",
        "☐",
        "Names: Assumptions, Statement, Operations, Financing",
    ),
    (
        "Color coding used consistently",
        "☐",
        "Blue: Inputs; Black: Formulas; Green: Calculations",
    ),
    ("No #REF! or #DIV/0! errors anywhere", "☐", "Search entire workbook for errors"),
    (
        "Units shown clearly ($, %, #)",
        "☐",
        "Format cells with appropriate number formats",
    ),
    (
        "Charts are labeled with titles and axis labels",
        "☐",
        "No orphan charts without context",
    ),
    (
        "Page setup optimized for printing/displaying",
        "☐",
        "Fit to page width; headers repeat on print",
    ),
]
for item, box, note in fmt_checks:
    content.append(Paragraph(f"{box}  {item}", checklist_style))
    content.append(Paragraph(note, note_style))

content.append(Paragraph("Error Checking Commands:", subsection))
content.append(Paragraph("Run these checks before every presentation:", body_style))
for cmd in [
    "Balance verification: A = L + E on every scenario",
    "Cash reconciliation: Balance Sheet cash = Cash Flow ending",
    "Sign convention: Expenses negative, revenue positive",
    "Time series: No gaps or overlaps in monthly columns",
]:
    content.append(Paragraph(f"• {cmd}", checklist_style))
content.append(PageBreak())

# Final Verification
content.append(Paragraph("5. PRE-PITCH FINAL CHECK", section_header))
content.append(Spacer(1, 0.1 * inch))

final_checks = [
    ("All input cells are accessible and editable", "☐", "No hidden or locked inputs"),
    (
        "Model runs without macros or add-ins",
        "☐",
        "Plain Excel/Google Sheets functionality",
    ),
    (
        "Scenario toggle changes all related outputs",
        "☐",
        "Full model updates in <5 seconds",
    ),
    (
        "You can explain every assumption verbally",
        "☐",
        "No black boxes or unexplained variables",
    ),
    (
        "Backup copy saved with date in filename",
        "☐",
        "e.g., TechStart_Model_20260113_backup.xlsx",
    ),
]
for item, box, note in final_checks:
    content.append(Paragraph(f"{box}  {item}", checklist_style))
    content.append(Paragraph(note, note_style))

content.append(Spacer(1, 0.3 * inch))
content.append(
    Paragraph(
        "Remember: Your financial model is a living document that tells the story of your business. Judges will probe the assumptions and test the logic. Build credibility through transparency.",
        ParagraphStyle(
            "Final",
            parent=body_style,
            alignment=TA_CENTER,
            textColor=DARK_NAVY,
            fontName="Helvetica-Bold",
        ),
    )
)

doc.build(content)
print("Generated: capstone_model_tour_checklist.pdf")
