#!/usr/bin/env python3
"""Generate Capstone Business Plan Guide PDF"""

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
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# Colors
DARK_NAVY = HexColor("#1a2744")
ACCENT_BLUE = HexColor("#3b5998")
LIGHT_GRAY = HexColor("#f5f5f5")
MID_GRAY = HexColor("#666666")

doc = SimpleDocTemplate(
    "/Users/daniel.bodanske/Desktop/bus-math-v2/public/pdfs/capstone_business_plan_guide.pdf",
    pagesize=letter,
    rightMargin=0.75 * inch,
    leftMargin=0.75 * inch,
    topMargin=0.75 * inch,
    bottomMargin=0.75 * inch,
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    "CustomTitle",
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
    fontName="Helvetica",
)

section_header = ParagraphStyle(
    "SectionHeader",
    parent=styles["Heading2"],
    fontSize=16,
    textColor=DARK_NAVY,
    spaceBefore=20,
    spaceAfter=10,
    fontName="Helvetica-Bold",
)

subsection = ParagraphStyle(
    "Subsection",
    parent=styles["Heading3"],
    fontSize=13,
    textColor=ACCENT_BLUE,
    spaceBefore=15,
    spaceAfter=8,
    fontName="Helvetica-Bold",
)

body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontSize=10,
    textColor="#333333",
    spaceAfter=8,
    alignment=TA_JUSTIFY,
    fontName="Helvetica",
    leading=14,
)

bullet_style = ParagraphStyle(
    "Bullet",
    parent=styles["Normal"],
    fontSize=10,
    textColor="#333333",
    spaceAfter=4,
    leftIndent=20,
    fontName="Helvetica",
    leading=13,
)

label_style = ParagraphStyle(
    "Label",
    parent=styles["Normal"],
    fontSize=9,
    textColor=MID_GRAY,
    spaceAfter=2,
    fontName="Helvetica-Bold",
)

content = []

# Cover
content.append(Spacer(1, 2 * inch))
content.append(Paragraph("BUSINESS PLAN", title_style))
content.append(Spacer(1, 0.3 * inch))
content.append(Paragraph("Capstone Project Guide", subtitle_style))
content.append(Spacer(1, 0.5 * inch))
content.append(Paragraph("TechStart Financial Model Series", subtitle_style))
content.append(Spacer(1, 2 * inch))
content.append(
    Paragraph(
        "A comprehensive framework for developing investor-ready business plans with integrated financial modeling.",
        ParagraphStyle(
            "Center", parent=body_style, alignment=TA_CENTER, textColor=MID_GRAY
        ),
    )
)
content.append(PageBreak())

# Table of Contents
content.append(Paragraph("TABLE OF CONTENTS", section_header))
content.append(Spacer(1, 0.3 * inch))

toc_items = [
    ("1. Executive Summary", "3"),
    ("2. Company Description", "4"),
    ("3. Market Analysis", "5"),
    ("4. Organization & Management", "6"),
    ("5. Financial Projections", "7"),
    ("6. Funding Request", "8"),
    ("7. Financial Model Tour", "9"),
]

for item, page in toc_items:
    content.append(Paragraph(f"{item} {'.' * (60 - len(item))} {page}", body_style))

content.append(PageBreak())

# Section 1: Executive Summary
content.append(Paragraph("1. EXECUTIVE SUMMARY", section_header))
content.append(Spacer(1, 0.2 * inch))
content.append(
    Paragraph(
        "The executive summary is your first impression. It should be compelling, concise, and complete. Investors typically spend fewer than 5 minutes on this section, so make every word count.",
        body_style,
    )
)

content.append(Paragraph("Key Components", subsection))
for item in [
    "Business concept and value proposition",
    "Target market and opportunity size",
    "Competitive advantage and differentiation",
    "Financial highlights (revenue, growth, profitability)",
    "Funding request and use of funds",
    "Leadership team and track record",
]:
    content.append(Paragraph(f"• {item}", bullet_style))

content.append(Paragraph("Tips for Success", subsection))
content.append(
    Paragraph(
        "Write this section last, after you have completed all other sections. By then, you will have a clear picture of your business and can distill the most important points.",
        body_style,
    )
)
content.append(PageBreak())

# Section 2: Company Description
content.append(Paragraph("2. COMPANY DESCRIPTION", section_header))
content.append(Spacer(1, 0.2 * inch))

content.append(Paragraph("Mission Statement", subsection))
content.append(
    Paragraph(
        "Define your company's purpose and the problem you solve. Keep it memorable—aim for one or two sentences that capture your essence.",
        body_style,
    )
)

content.append(Paragraph("Business Model", subsection))
content.append(
    Paragraph(
        "Describe how your company creates, delivers, and captures value. Address:",
        body_style,
    )
)
for item in [
    "Revenue streams and pricing strategy",
    "Cost structure and key partnerships",
    "Customer segments and channels",
    "Key resources and activities",
]:
    content.append(Paragraph(f"• {item}", bullet_style))

content.append(Paragraph("History & Milestones", subsection))
content.append(
    Paragraph(
        "Brief timeline of key achievements, pivots, and growth metrics. Demonstrate momentum and ability to execute.",
        body_style,
    )
)
content.append(PageBreak())

# Section 3: Market Analysis
content.append(Paragraph("3. MARKET ANALYSIS", section_header))
content.append(Spacer(1, 0.2 * inch))

content.append(Paragraph("Market Size", subsection))
content.append(Paragraph("TAM / SAM / SOM framework:", body_style))
for item in [
    "TAM (Total Addressable Market): The total market demand",
    "SAM (Serviceable Addressable Market): Your geographic/target segment",
    "SOM (Serviceable Obtainable Market): The realistic share you can capture",
]:
    content.append(Paragraph(f"• {item}", bullet_style))

content.append(Paragraph("Target Customer Profile", subsection))
content.append(
    Paragraph(
        "Detailed description of your ideal customer. Include demographics, psychographics, behavior patterns, and pain points. Use data from your TechStart financial model to quantify customer value.",
        body_style,
    )
)

content.append(Paragraph("Competitive Landscape", subsection))
content.append(Paragraph("Present a competitive analysis matrix:", body_style))
comp_data = [
    ["Competitor", "Strengths", "Weaknesses", "Market Share"],
    ["Competitor A", "Brand recognition", "High prices", "25%"],
    ["Competitor B", "Wide distribution", "Low quality", "30%"],
    ["TechStart", "Integrated model", "New to market", "—"],
]
t = Table(comp_data, colWidths=[1.2 * inch, 1.5 * inch, 1.5 * inch, 1 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -1), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(PageBreak())

# Section 4: Organization
content.append(Paragraph("4. ORGANIZATION & MANAGEMENT", section_header))
content.append(Spacer(1, 0.2 * inch))

content.append(Paragraph("Organizational Structure", subsection))
content.append(
    Paragraph(
        "Present an organizational chart showing key roles and reporting relationships. For the TechStart capstone, focus on the founder/CEO, CFO, and operational leads.",
        body_style,
    )
)

content.append(Paragraph("Leadership Team", subsection))
for member in ["Founder / CEO", "CFO / Finance Lead", "Operations Manager"]:
    content.append(
        Paragraph(
            f"• {member}: Brief background, relevant experience, and key accomplishments.",
            bullet_style,
        )
    )

content.append(Paragraph("Advisory Board", subsection))
content.append(
    Paragraph(
        "List any advisors, mentors, or board members who provide strategic guidance. Even fictional TechStart advisory suggestions add credibility.",
        body_style,
    )
)
content.append(PageBreak())

# Section 5: Financial Projections
content.append(Paragraph("5. FINANCIAL PROJECTIONS", section_header))
content.append(Spacer(1, 0.2 * inch))

content.append(
    Paragraph(
        "Use your TechStart investor workbook as the foundation. Include:", body_style
    )
)

for item in [
    "Three-year income statement projections with assumptions",
    "Cash flow statement showing monthly burn rate and runway",
    "Balance sheet projections including key asset and liability categories",
    "Break-even analysis and key assumption sensitivities",
]:
    content.append(Paragraph(f"• {item}", bullet_style))

content.append(Paragraph("Key Metrics Table", subsection))
metrics_data = [
    ["Metric", "Year 1", "Year 2", "Year 3"],
    ["Revenue", "$XX,XXX", "$XX,XXX", "$XX,XXX"],
    ["Gross Margin", "XX%", "XX%", "XX%"],
    ["Net Income", "$XX,XXX", "$XX,XXX", "$XX,XXX"],
    ["Runway (months)", "XX", "XX", "—"],
]
t = Table(metrics_data, colWidths=[1.5 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (0, -1), "LEFT"),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -1), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(PageBreak())

# Section 6: Funding Request
content.append(Paragraph("6. FUNDING REQUEST", section_header))
content.append(Spacer(1, 0.2 * inch))

content.append(Paragraph("Investment Thesis", subsection))
content.append(
    Paragraph(
        "State how much capital you are raising and why. Explain the milestone this funding will enable and the expected return for investors.",
        body_style,
    )
)

content.append(Paragraph("Use of Funds", subsection))
use_data = [
    ["Category", "Allocation", "% of Total"],
    ["Product Development", "$XX,XXX", "XX%"],
    ["Sales & Marketing", "$XX,XXX", "XX%"],
    ["Operations", "$XX,XXX", "XX%"],
    ["General & Administrative", "$XX,XXX", "XX%"],
    ["TOTAL", "$XX,XXX", "100%"],
]
t = Table(use_data, colWidths=[2 * inch, 1.2 * inch, 1 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (0, -1), "LEFT"),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -2), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(PageBreak())

# Section 7: Financial Model Tour
content.append(Paragraph("7. FINANCIAL MODEL TOUR", section_header))
content.append(Spacer(1, 0.2 * inch))

content.append(
    Paragraph(
        "Your investor workbook is the centerpiece of due diligence. Present it with the following structure:",
        body_style,
    )
)

content.append(Paragraph("Statement Tab", subsection))
content.append(
    Paragraph(
        "Income Statement, Balance Sheet, and Cash Flow Statement linked through the operating cycle. All statements reference a single 'Assumptions' input section.",
        body_style,
    )
)

content.append(Paragraph("Operations Tab", subsection))
content.append(
    Paragraph(
        "Revenue build, cost of goods sold, operating expenses broken down by fixed and variable components. Monthly/quarterly projections with seasonal adjustments.",
        body_style,
    )
)

content.append(Paragraph("Financing Tab", subsection))
content.append(
    Paragraph(
        "Debt schedule, equity structure, investor returns analysis. Includes scenario modeling for different funding amounts and runway scenarios.",
        body_style,
    )
)

content.append(Paragraph("Key Model Features", subsection))
for item in [
    "Dynamic sensitivity analysis with scenario toggles",
    "Charts showing revenue build, margin trends, and cash flow",
    "Working capital requirements by month",
    "Breakeven calculation with visual indicator",
    "Error checking with balance verification (A = L + E)",
]:
    content.append(Paragraph(f"• {item}", bullet_style))

content.append(Spacer(1, 0.3 * inch))
content.append(
    Paragraph(
        "Remember: Your financial model tells the story of your business. Investors will scrutinize every assumption. Build credibility through transparency and rigorous logic.",
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
print("Generated: capstone_business_plan_guide.pdf")
