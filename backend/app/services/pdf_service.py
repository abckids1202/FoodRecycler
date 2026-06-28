from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from sqlalchemy.orm import Session

from app.database.models import Analysis, FoodRecipe, Recommendation


PDF_DIR = Path("app/generated_pdfs")


def build_recommendation_pdf(db: Session, recommendation_id: int) -> Path | None:
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        return None

    analysis = db.query(Analysis).filter(Analysis.id == recommendation.analysis_id).first()
    recipe = db.query(FoodRecipe).filter(FoodRecipe.recipe_key == recommendation.recipe_key).first()

    PDF_DIR.mkdir(parents=True, exist_ok=True)
    output_path = PDF_DIR / f"foodloop-recommendation-{recommendation.id}.pdf"
    styles = getSampleStyleSheet()
    story = [
        Paragraph("FoodLoop AI Recipe Detail", styles["Title"]),
        Spacer(1, 12),
        Paragraph(f"<b>{recommendation.recipe_name}</b>", styles["Heading2"]),
        Paragraph(f"Score: {recommendation.score}", styles["Normal"]),
        Paragraph(f"Reason: {recommendation.reason}", styles["Normal"]),
        Spacer(1, 10),
    ]

    if analysis:
        detected = [item.display_name for item in analysis.items if not item.is_safety_flag]
        story.extend(
            [
                Paragraph("Leftover Input", styles["Heading3"]),
                Paragraph(f"Condition: {analysis.condition}", styles["Normal"]),
                Paragraph(f"Safety level: {analysis.safety_level}", styles["Normal"]),
                Paragraph(f"Detected leftovers: {', '.join(detected) if detected else 'No clear leftover labels'}", styles["Normal"]),
                Paragraph(f"Safety notes: {'; '.join(analysis.safety_notes or []) or 'No extra notes'}", styles["Normal"]),
                Spacer(1, 10),
            ]
        )

    if recipe:
        story.extend(
            [
                Paragraph("Ingredients", styles["Heading3"]),
                *[Paragraph(f"- {item}", styles["Normal"]) for item in recipe.ingredients or []],
                Spacer(1, 8),
                Paragraph("Steps", styles["Heading3"]),
                *[Paragraph(f"{index}. {step}", styles["Normal"]) for index, step in enumerate(recipe.steps or [], start=1)],
                Spacer(1, 8),
                Paragraph("Safety Notes", styles["Heading3"]),
                *[Paragraph(f"- {item}", styles["Normal"]) for item in (recipe.safety_notes or recommendation.warnings or [])],
            ]
        )
    else:
        story.append(Paragraph("Recipe detail is not available in the JSON/database yet.", styles["Normal"]))

    doc = SimpleDocTemplate(str(output_path), pagesize=A4, title=f"FoodLoop AI - {recommendation.recipe_name}")
    doc.build(story)
    return output_path
