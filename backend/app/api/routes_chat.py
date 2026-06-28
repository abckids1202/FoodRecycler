from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.db import get_db
from app.database.models import Analysis, DetectedLeftover
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.openai_service import generate_openai_reply, openai_is_configured
from app.services.recommendation_service import recommend_for_analysis
from app.services.safety_service import evaluate_safety
from app.services.text_analyzer_service import analyze_text


router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/messages", response_model=ChatMessageResponse)
def create_chat_message(payload: ChatMessageRequest, db: Session = Depends(get_db)):
    detected_items, initial_safety_notes = analyze_text(payload.message)
    safety_level, safety_notes = evaluate_safety(payload.condition, initial_safety_notes)

    analysis = Analysis(
        user_id=payload.user_id,
        input_type="chat_text",
        condition=payload.condition,
        source_text=payload.message,
        safety_level=safety_level,
        safety_notes=safety_notes,
    )
    db.add(analysis)
    db.flush()

    for item in detected_items:
        db.add(DetectedLeftover(analysis_id=analysis.id, **item))

    db.commit()
    db.refresh(analysis)
    recommendations = recommend_for_analysis(db, analysis)

    detected_labels = [item["label"] for item in detected_items if not item.get("is_safety_flag")]
    if settings.recipe_response_mode == "openai" and openai_is_configured():
        try:
            reply = generate_openai_reply(
                payload.message,
                detected_labels,
                [recommendation.recipe_name for recommendation in recommendations],
            )
        except Exception:
            reply = _build_rules_reply(detected_labels, recommendations, safety_level, safety_notes)
    elif recommendations:
        reply = _build_rules_reply(detected_labels, recommendations, safety_level, safety_notes)
    else:
        reply = (
            "Aku belum bisa mencocokkan leftover itu dengan database makanan Indonesia saat ini.\n\n"
            "Aku perlu cek 2-3 hal dulu:\n"
            "- Kapan makanan ini dimasak atau dibeli?\n"
            "- Sejak itu disimpan di kulkas, freezer, atau suhu ruang?\n"
            "- Ada bau asam/busuk, lendir, jamur, atau warna berubah?\n\n"
            "PENTING: Jika ada bau busuk, lendir, jamur, atau terlalu lama di suhu ruang, lebih aman dibuang."
        )

    return ChatMessageResponse(
        reply=reply,
        analysis_id=analysis.id,
        detected_labels=detected_labels,
        recommendations=recommendations,
    )


def _build_rules_reply(detected_labels: list[str], recommendations, safety_level: str, safety_notes: list[str]) -> str:
    missing_questions = [
        "Kapan terakhir dimasak atau dihangatkan?",
        "Sejak itu disimpan di kulkas, freezer, atau suhu ruang?",
        "Ada bau asam/busuk, warna berubah, lendir, jamur, atau expired?",
    ]
    top_items = recommendations[:3]
    safety_label = {
        "eligible_with_freshness_check": "AMAN JIKA KONDISI NORMAL",
        "needs_user_review": "BUTUH KONFIRMASI",
        "not_safe_for_edible_reuse": "JANGAN DIKONSUMSI",
    }.get(safety_level, "BUTUH KONFIRMASI")

    lines = [
        "Bisa aku bantu cek.",
        "",
        "Yang aku tangkap:",
        f"- {', '.join(detected_labels) if detected_labels else 'belum jelas'}",
        "",
        "Status keamanan sementara:",
        f"- {safety_label}",
    ]

    if safety_notes:
        lines.extend(["", "PENTING: " + " ".join(safety_notes)])

    lines.extend(["", "Aku perlu cek 2-3 hal dulu:"])
    lines.extend([f"- {question}" for question in missing_questions])

    if top_items:
        lines.extend(["", "Ide yang bisa dibuat kalau masih aman:"])
        for item in top_items:
            lines.extend(
                [
                    f"- {item.recipe_name}",
                    "  Cocok kalau leftover masih normal, tidak bau, tidak berlendir, dan disimpan aman.",
                    "  Waktu: sekitar 10-30 menit.",
                    "  Langkah: cek kondisi, panaskan sampai beruap, olah dengan bumbu sederhana, sajikan segera.",
                    "  Catatan keamanan: panaskan sampai sekitar 74 C dan jangan panaskan berulang kali.",
                    "  Estimasi gizi kasar karena jumlah bahan belum pasti.",
                ]
            )

    lines.extend(
        [
            "",
            "Kalau ternyata tidak aman:",
            "- Jangan dipaksakan untuk dimakan. Jika cocok, arahkan ke kompos/eco-enzyme, atau buang dengan aman.",
            "",
            "Balas dengan umur makanan dan cara penyimpanannya, nanti aku pilihkan resep paling aman.",
        ]
    )
    return "\n".join(lines)
