#!/usr/bin/env python3
"""Generate Capstone Pitch Rubric PDF"""

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

DARK_NAVY = HexColor("#1a2744")
ACCENT_BLUE = HexColor("#3b5998")
LIGHT_GRAY = HexColor("#f5f5f5")
MID_GRAY = HexColor("#666666")
GOLD = HexColor("#c9a227")
GREEN = HexColor("#2d6a4f")
RED = HexColor("#8b2635")

doc = SimpleDocTemplate(
    "/Users/daniel.bodanske/Desktop/bus-math-v2/public/pdfs/capstone_pitch_rubric.pdf",
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
    spaceBefore=20,
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
score_label = ParagraphStyle(
    "Score",
    parent=styles["Normal"],
    fontSize=9,
    textColor=MID_GRAY,
    spaceAfter=2,
    fontName="Helvetica",
)

content = []

# Cover
content.append(Spacer(1, 2 * inch))
content.append(Paragraph("CAPSTONE PITCH", title_style))
content.append(Spacer(1, 0.3 * inch))
content.append(Paragraph("Evaluation Rubric", subtitle_style))
content.append(Spacer(1, 1 * inch))
content.append(
    Paragraph(
        "40-Point Scoring System",
        ParagraphStyle(
            "Center",
            parent=body_style,
            alignment=TA_CENTER,
            textColor=DARK_NAVY,
            fontName="Helvetica-Bold",
        ),
    )
)
content.append(Spacer(1, 2 * inch))
content.append(PageBreak())

# Rubric Overview
content.append(Paragraph("EVALUATION OVERVIEW", section_header))
content.append(Spacer(1, 0.15 * inch))
content.append(
    Paragraph(
        "This rubric evaluates the final capstone pitch presentation. Students present their business plan and financial model to a panel of judges. Each category is scored on a 0-40 point scale adapted for the category weight.",
        body_style,
    )
)
content.append(Spacer(1, 0.2 * inch))

# Score bands
content.append(Paragraph("Score Bands", subsection))
bands_data = [
    ["Score Range", "Performance Level", "Description"],
    ["36-40", "Exceptional", "Exceeds expectations; demonstrates mastery"],
    ["28-35", "Proficient", "Meets all expectations; minor gaps"],
    ["20-27", "Developing", "Meets some expectations; gaps evident"],
    ["0-19", "Beginning", "Does not meet expectations"],
]
t = Table(bands_data, colWidths=[1.2 * inch, 1.2 * inch, 4 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -1), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(PageBreak())

# Category 1: Content & Structure
content.append(
    Paragraph("CATEGORY 1: PRESENTATION CONTENT & STRUCTURE", section_header)
)
content.append(
    Paragraph(
        "Weight: 10 points",
        ParagraphStyle("Weight", parent=score_label, fontName="Helvetica-Bold"),
    )
)
content.append(Spacer(1, 0.15 * inch))

c1_data = [
    ["Criteria", "Score", "Evidence"],
    ["Opening hooks attention", "/10", "Strong hook in first 30 seconds"],
    ["Logical flow and transitions", "/10", "Clear narrative arc; seamless segues"],
    ["Conclusion reinforces key points", "/10", "Memorable close; call to action"],
    ["Time management (10 min limit)", "/10", "Within time; no rushing at end"],
    ["SUBTOTAL", "___/40 → ___/10", ""],
]
t = Table(c1_data, colWidths=[2.5 * inch, 0.8 * inch, 3 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (1, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -2), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(Spacer(1, 0.2 * inch))
content.append(Paragraph("Evidence notes:", body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(PageBreak())

# Category 2: Financial Clarity
content.append(Paragraph("CATEGORY 2: FINANCIAL CLARITY", section_header))
content.append(
    Paragraph(
        "Weight: 10 points",
        ParagraphStyle("Weight", parent=score_label, fontName="Helvetica-Bold"),
    )
)
content.append(Spacer(1, 0.15 * inch))

c2_data = [
    ["Criteria", "Score", "Evidence"],
    ["Assumptions stated clearly", "/10", "Revenue drivers, cost structure justified"],
    [
        "Financial model accuracy",
        "/10",
        "Balances; formulas correct; linked statements",
    ],
    ["Key metrics presented", "/10", "TAM, growth rate, break-even, ROI stated"],
    [
        "Understandable to non-finance audience",
        "/10",
        "No jargon; visual aids support explanation",
    ],
    ["SUBTOTAL", "___/40 → ___/10", ""],
]
t = Table(c2_data, colWidths=[2.5 * inch, 0.8 * inch, 3 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (1, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -2), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(Spacer(1, 0.2 * inch))
content.append(Paragraph("Evidence notes:", body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(PageBreak())

# Category 3: Market Understanding
content.append(
    Paragraph("CATEGORY 3: MARKET & COMPETITIVE UNDERSTANDING", section_header)
)
content.append(
    Paragraph(
        "Weight: 10 points",
        ParagraphStyle("Weight", parent=score_label, fontName="Helvetica-Bold"),
    )
)
content.append(Spacer(1, 0.15 * inch))

c3_data = [
    ["Criteria", "Score", "Evidence"],
    ["Target market defined precisely", "/10", "Specific segments; size quantified"],
    ["Competitive landscape analysis", "/10", "Direct/indirect competitors identified"],
    ["Differentiation clearly articulated", "/10", "Unique value proposition explicit"],
    ["Market opportunity compelling", "/10", "Why now; why this team; why this market"],
    ["SUBTOTAL", "___/40 → ___/10", ""],
]
t = Table(c3_data, colWidths=[2.5 * inch, 0.8 * inch, 3 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (1, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -2), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(Spacer(1, 0.2 * inch))
content.append(Paragraph("Evidence notes:", body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(PageBreak())

# Category 4: Q&A Handling
content.append(Paragraph("CATEGORY 4: Q&A HANDLING", section_header))
content.append(
    Paragraph(
        "Weight: 5 points",
        ParagraphStyle("Weight", parent=score_label, fontName="Helvetica-Bold"),
    )
)
content.append(Spacer(1, 0.15 * inch))

c4_data = [
    ["Criteria", "Score", "Evidence"],
    ["Listens to questions fully", "/10", "No interrupting; clarifies if needed"],
    [
        "Responds with specific evidence",
        "/10",
        "References data, model, or prior statements",
    ],
    [
        "Admits uncertainty appropriately",
        "/10",
        'Says "I don\'t know" rather than guessing',
    ],
    [
        "Defends position respectfully",
        "/10",
        "Stands by analysis; acknowledges alternatives",
    ],
    ["SUBTOTAL", "___/40 → ___/5", ""],
]
t = Table(c4_data, colWidths=[2.5 * inch, 0.8 * inch, 3 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (1, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -2), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(Spacer(1, 0.2 * inch))
content.append(Paragraph("Evidence notes:", body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(PageBreak())

# Category 5: Delivery
content.append(Paragraph("CATEGORY 5: DELIVERY & PROFESSIONALISM", section_header))
content.append(
    Paragraph(
        "Weight: 5 points",
        ParagraphStyle("Weight", parent=score_label, fontName="Helvetica-Bold"),
    )
)
content.append(Spacer(1, 0.15 * inch))

c5_data = [
    ["Criteria", "Score", "Evidence"],
    ["Eye contact and presence", "/10", "Engages panel; not reading slides"],
    ["Vocal delivery (pace, clarity)", "/10", "Articulate; not monotone; pauses well"],
    ["Visual aids quality", "/10", "Clean; readable; supports narrative"],
    ["Poise under pressure", "/10", "Composed; confident; handles interruptions"],
    ["SUBTOTAL", "___/40 → ___/5", ""],
]
t = Table(c5_data, colWidths=[2.5 * inch, 0.8 * inch, 3 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (1, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -2), LIGHT_GRAY),
        ]
    )
)
content.append(t)
content.append(Spacer(1, 0.2 * inch))
content.append(Paragraph("Evidence notes:", body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(PageBreak())

# Final Score Summary
content.append(Paragraph("FINAL SCORE SUMMARY", section_header))
content.append(Spacer(1, 0.15 * inch))

summary_data = [
    ["Category", "Points Available", "Points Earned"],
    ["Presentation Content & Structure", "10", ""],
    ["Financial Clarity", "10", ""],
    ["Market & Competitive Understanding", "10", ""],
    ["Q&A Handling", "5", ""],
    ["Delivery & Professionalism", "5", ""],
    ["TOTAL", "40", ""],
]
t = Table(summary_data, colWidths=[3 * inch, 1.5 * inch, 1.5 * inch])
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), DARK_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("BACKGROUND", (0, 1), (-1, -2), LIGHT_GRAY),
            ("BACKGROUND", (0, -1), (-1, -1), HexColor("#e8e8e8")),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ]
    )
)
content.append(t)
content.append(Spacer(1, 0.3 * inch))
content.append(Paragraph("Feedback Summary:", body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Paragraph("_" * 80, body_style))
content.append(Spacer(1, 0.3 * inch))
content.append(
    Paragraph(
        "Overall Rating: ☐ Exceptional  ☐ Proficient  ☐ Developing  ☐ Beginning",
        ParagraphStyle(
            "Final", parent=body_style, alignment=TA_CENTER, fontName="Helvetica-Bold"
        ),
    )
)
content.append(Spacer(1, 0.2 * inch))
content.append(
    Paragraph("Evaluator Signature: ___________________  Date: ___________", body_style)
)

doc.build(content)
print("Generated: capstone_pitch_rubric.pdf")
