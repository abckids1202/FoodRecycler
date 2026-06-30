from __future__ import annotations

import re
from pathlib import Path

from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.database.models import Analysis, BotConversation, DetectedLeftover, FoodRecipe, Recommendation
from app.schemas.bot import BotIncomingMessage, BotReply
from app.services.bot_state_service import get_or_create_conversation, log_bot_message, save_conversation
from app.services.image_identifier_service import identify_leftovers_from_image
from app.services.pdf_service import build_recommendation_pdf
from app.services.recommendation_service import recommend_for_analysis
from app.services.safety_service import evaluate_safety
from app.services.text_analyzer_service import analyze_text


START_TRIGGERS = {"/start", "start", "halo", "hai", "hi", "mulai", "hello"}
PDF_TRIGGERS = {"pdf", "buat pdf", "unduh", "download", "download pdf", "unduh pdf"}
UNSAFE_WORDS = ["bau", "busuk", "asam", "basi", "lendir", "berlendir", "jamur", "berjamur", "mold", "slimy", "spoiled"]
ROOM_TEMP_RISK = ["suhu ruang", "meja", "luar kulkas", "tidak di kulkas", "room"]


def handle_bot_message(db: Session, incoming: BotIncomingMessage) -> BotReply:
    conversation = get_or_create_conversation(
        db,
        platform=incoming.platform.value,
        platform_user_id=incoming.platform_user_id,
        display_name=incoming.display_name,
    )
    text = (incoming.text or "").strip()
    message_type = "image" if incoming.image_path else "text"
    log_bot_message(
        db,
        conversation_id=conversation.id,
        direction="in",
        message_type=message_type,
        text=text or None,
        media_url=incoming.image_path,
    )

    language = detect_language(text, conversation.language)
    context = dict(conversation.context_json or {})

    if is_start_message(text) and not incoming.image_path:
        return _reply_and_save(db, conversation, _start_reply(language), "WAITING_FOR_INPUT", context, language)

    if incoming.image_path:
        return _handle_food_input(db, conversation, language, context, image_path=incoming.image_path)

    if conversation.state in {"START", "DONE"} and text:
        if is_start_message(text):
            return _reply_and_save(db, conversation, _start_reply(language), "WAITING_FOR_INPUT", context, language)
        return _handle_food_input(db, conversation, language, context, text=text)

    if conversation.state == "WAITING_FOR_INPUT":
        if not text:
            return _reply_and_save(db, conversation, [_unclear_reply(language)], "WAITING_FOR_INPUT", context, language)
        return _handle_food_input(db, conversation, language, context, text=text)

    if conversation.state == "WAITING_FOR_SAFETY_ANSWER":
        return _handle_safety_answer(db, conversation, language, context, text)

    if conversation.state == "WAITING_FOR_RECIPE_CHOICE":
        return _handle_recipe_choice(db, conversation, language, context, text)

    if conversation.state == "OFFERING_PDF":
        return _handle_pdf_or_done(db, conversation, language, context, text)

    return _reply_and_save(db, conversation, _start_reply(language), "WAITING_FOR_INPUT", context, language)


def _handle_food_input(
    db: Session,
    conversation: BotConversation,
    language: str,
    context: dict,
    *,
    text: str | None = None,
    image_path: str | None = None,
) -> BotReply:
    try:
        if image_path:
            detected_items, initial_safety_notes = identify_leftovers_from_image(image_path)
            input_type = "image"
            source_text = text
        else:
            detected_items, initial_safety_notes = analyze_text(text or "")
            input_type = "text"
            source_text = text
    except Exception:
        return _reply_and_save(
            db,
            conversation,
            [_image_failed_reply(language) if image_path else _unclear_reply(language)],
            "WAITING_FOR_INPUT",
            context,
            language,
        )

    safety_level, safety_notes = evaluate_safety("unknown", initial_safety_notes)
    analysis = Analysis(
        input_type=input_type,
        condition="unknown",
        source_text=source_text,
        image_path=image_path,
        safety_level=safety_level,
        safety_notes=safety_notes,
    )
    db.add(analysis)
    db.flush()
    for item in detected_items:
        db.add(DetectedLeftover(analysis_id=analysis.id, **item))
    db.commit()
    analysis = _load_analysis(db, analysis.id)

    labels = _display_labels(analysis)
    context.update(
        {
            "detected_leftovers": labels,
            "last_analysis_id": analysis.id,
            "safety_notes": analysis.safety_notes or [],
        }
    )
    messages = [_safety_question_reply(language, labels)]
    return _reply_and_save(
        db,
        conversation,
        messages,
        "WAITING_FOR_SAFETY_ANSWER",
        context,
        language,
        last_analysis_id=analysis.id,
    )


def _handle_safety_answer(db: Session, conversation: BotConversation, language: str, context: dict, text: str) -> BotReply:
    analysis_id = context.get("last_analysis_id") or conversation.last_analysis_id
    analysis = _load_analysis(db, analysis_id) if analysis_id else None
    if not analysis:
        return _reply_and_save(db, conversation, [_unclear_reply(language)], "WAITING_FOR_INPUT", context, language)

    condition = _condition_from_safety_answer(text)
    notes = list(context.get("safety_notes") or analysis.safety_notes or [])
    if condition == "spoiled":
        notes.append("User mentioned spoilage signs or unsafe storage.")
    safety_level, safety_notes = evaluate_safety(condition, notes)
    analysis.condition = condition
    analysis.safety_level = safety_level
    analysis.safety_notes = safety_notes
    analysis.source_text = f"{analysis.source_text or ''}\n\nSafety answer: {text}".strip()
    db.commit()
    analysis = _load_analysis(db, analysis.id)

    context["safety_answers"] = text
    context["safety_label"] = safety_level
    context["safety_notes"] = safety_notes

    if safety_level == "not_safe_for_edible_reuse":
        messages = [_unsafe_reply(language, safety_notes)]
        return _reply_and_save(db, conversation, messages, "UNSAFE_FOOD", context, language)

    recommendations = recommend_for_analysis(db, analysis)[:4]
    if not recommendations:
        messages = [_no_recipe_reply(language)]
        return _reply_and_save(db, conversation, messages, "DONE", context, language)

    context["recipe_options"] = [{"id": item.id, "name": item.recipe_name} for item in recommendations]
    messages = [_recipe_options_reply(language, safety_level, recommendations, safety_notes)]
    return _reply_and_save(db, conversation, messages, "WAITING_FOR_RECIPE_CHOICE", context, language)


def _handle_recipe_choice(db: Session, conversation: BotConversation, language: str, context: dict, text: str) -> BotReply:
    match = re.search(r"\d+", text or "")
    options = context.get("recipe_options") or []
    if not match or not options:
        return _reply_and_save(db, conversation, [_choose_number_reply(language)], "WAITING_FOR_RECIPE_CHOICE", context, language)

    index = int(match.group(0)) - 1
    if index < 0 or index >= len(options):
        return _reply_and_save(db, conversation, [_choose_number_reply(language)], "WAITING_FOR_RECIPE_CHOICE", context, language)

    recommendation_id = options[index]["id"]
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        return _reply_and_save(db, conversation, [_choose_number_reply(language)], "WAITING_FOR_RECIPE_CHOICE", context, language)

    context["selected_recipe"] = recommendation.recipe_name
    context["last_recommendation_id"] = recommendation.id
    messages = _recipe_detail_reply(db, language, recommendation)
    return _reply_and_save(
        db,
        conversation,
        messages,
        "OFFERING_PDF",
        context,
        language,
        last_recommendation_id=recommendation.id,
    )


def _handle_pdf_or_done(db: Session, conversation: BotConversation, language: str, context: dict, text: str) -> BotReply:
    normalized = (text or "").strip().lower()
    if normalized in PDF_TRIGGERS:
        recommendation_id = context.get("last_recommendation_id") or conversation.last_recommendation_id
        if not recommendation_id:
            return _reply_and_save(db, conversation, [_pdf_failed_reply(language)], "DONE", context, language)
        output_path = build_recommendation_pdf(db, int(recommendation_id))
        if not output_path:
            return _reply_and_save(db, conversation, [_pdf_failed_reply(language)], "DONE", context, language)
        document_url = _pdf_download_url(int(recommendation_id))
        messages = [_pdf_ready_reply(language, document_url)]
        reply = _reply_and_save(db, conversation, messages, "DONE", context, language)
        reply.document_path = str(output_path)
        reply.document_url = document_url
        return reply

    return _reply_and_save(db, conversation, [_done_reply(language)], "DONE", context, language)


def _reply_and_save(
    db: Session,
    conversation: BotConversation,
    messages: list[str],
    state: str,
    context: dict,
    language: str,
    *,
    last_analysis_id: int | None = None,
    last_recommendation_id: int | None = None,
) -> BotReply:
    save_conversation(
        db,
        conversation,
        state=state,
        context=context,
        language=language,
        last_analysis_id=last_analysis_id,
        last_recommendation_id=last_recommendation_id,
    )
    for message in messages:
        log_bot_message(db, conversation_id=conversation.id, direction="out", text=message)
    return BotReply(messages=messages, state=state)


def detect_language(text: str, fallback: str = "id") -> str:
    lowered = (text or "").lower()
    english_markers = ["leftover", "recipe", "fridge", "freezer", "smell", "mold", "hello", "chicken", "rice"]
    indonesian_markers = ["nasi", "telur", "sambal", "kulkas", "basi", "bau", "resep", "makanan"]
    if any(marker in lowered for marker in english_markers) and not any(marker in lowered for marker in indonesian_markers):
        return "en"
    return fallback if fallback in {"id", "en"} else "id"


def is_start_message(text: str) -> bool:
    return (text or "").strip().lower() in START_TRIGGERS


def _condition_from_safety_answer(text: str) -> str:
    lowered = (text or "").lower()
    if _mentions_unsafe_sign(lowered):
        return "spoiled"
    if any(word in lowered for word in ROOM_TEMP_RISK) and any(token in lowered for token in ["2 jam", "3 jam", "4 jam", "semalam", "hari", "overnight"]):
        return "spoiled"
    if any(word in lowered for word in ["kulkas", "freezer", "fridge", "refrigerator"]) and not any(word in lowered for word in UNSAFE_WORDS):
        return "normal"
    return "unknown"


def _mentions_unsafe_sign(lowered: str) -> bool:
    negated_patterns = [
        "tidak bau",
        "tidak busuk",
        "tidak asam",
        "tidak basi",
        "tidak berlendir",
        "tidak ada lendir",
        "tidak berjamur",
        "tidak ada jamur",
        "tidak berubah warna",
        "no smell",
        "not slimy",
        "no mold",
        "not moldy",
    ]
    cleaned = lowered
    for pattern in negated_patterns:
        cleaned = cleaned.replace(pattern, "")
    return any(word in cleaned for word in UNSAFE_WORDS)


def _load_analysis(db: Session, analysis_id: int | None) -> Analysis | None:
    if not analysis_id:
        return None
    return (
        db.query(Analysis)
        .options(selectinload(Analysis.items), selectinload(Analysis.recommendations))
        .filter(Analysis.id == analysis_id)
        .first()
    )


def _display_labels(analysis: Analysis) -> list[str]:
    labels = []
    for item in analysis.items:
        if item.is_safety_flag:
            continue
        label = item.display_name or item.label
        if label not in labels:
            labels.append(label)
    return labels[:6] or ["leftover"]


def _recipe_detail_reply(db: Session, language: str, recommendation: Recommendation) -> list[str]:
    recipe = db.query(FoodRecipe).filter(FoodRecipe.recipe_key == recommendation.recipe_key).first()
    ingredients = (recipe.ingredients if recipe else [])[:6]
    steps = [_localize_step(step, language) for step in ((recipe.steps if recipe else [])[:6])]
    safety_note = _short_safety_note(language, recommendation.warnings)

    if language == "en":
        overview = [
            f"Recipe: {recommendation.recipe_name}",
            "",
            "Ingredients:",
            *[f"- {_clean_ingredient(item, language)}" for item in ingredients],
        ]
        step_message = [
            "Steps:",
            *[f"{index}. {step}" for index, step in enumerate(steps, start=1)],
            "",
            f"Safety note: {safety_note}",
            "",
            "Want a recipe PDF? Reply: PDF",
        ]
    else:
        overview = [
            f"Resep: {recommendation.recipe_name}",
            "",
            "Bahan:",
            *[f"- {_clean_ingredient(item, language)}" for item in ingredients],
        ]
        step_message = [
            "Langkah:",
            *[f"{index}. {step}" for index, step in enumerate(steps, start=1)],
            "",
            f"Catatan keamanan: {safety_note}",
            "",
            "Mau saya buatkan PDF resep? Balas: PDF",
        ]
    return ["\n".join(overview), "\n".join(step_message)]


def _pdf_download_url(recommendation_id: int) -> str:
    base_url = (settings.public_backend_url or "").rstrip("/")
    if not base_url:
        return f"/api/pdf/download/{recommendation_id}"
    return f"{base_url}/api/pdf/download/{recommendation_id}"


def _start_reply(language: str) -> list[str]:
    if language == "en":
        return [
            "Hi! I am FoodLoop AI.\n\nI can help turn leftovers into safer Indonesian recipe ideas.\n\nSend one:\n1. Food photo\n2. Leftover ingredients\n\nExample:\nleftover rice, egg, sambal - stored in the fridge since last night"
        ]
    return [
        "Halo! Saya FoodLoop AI.\n\nSaya bisa bantu mengubah sisa makanan menjadi resep Indonesia yang lebih aman.\n\nKirim salah satu:\n1. Foto makanan\n2. Tulis sisa makanan yang kamu punya\n\nContoh:\nnasi sisa, telur, sambal - disimpan di kulkas sejak semalam"
    ]


def _safety_question_reply(language: str, labels: list[str]) -> str:
    bullet_items = "\n".join(f"- {item}" for item in labels[:6])
    if language == "en":
        return (
            f"I found these ingredients:\n{bullet_items}\n\n"
            "Before recipe ideas, quick safety check:\n"
            "1. When was it cooked/bought?\n"
            "2. Was it stored in the fridge, freezer, or room temperature?\n"
            "3. Any sour smell, slime, mold, color change, or spoilage signs?"
        )
    return (
        f"Aku menangkap bahan ini:\n{bullet_items}\n\n"
        "Sebelum kasih resep, aku cek keamanan dulu ya.\n"
        "1. Kapan makanan ini dimasak/dibeli?\n"
        "2. Disimpan di kulkas, freezer, atau suhu ruang?\n"
        "3. Ada bau asam, lendir, jamur, warna berubah, atau tanda basi?"
    )


def _recipe_options_reply(language: str, safety_level: str, recommendations: list[Recommendation], safety_notes: list[str]) -> str:
    lines = []
    for index, item in enumerate(recommendations[:4], start=1):
        lines.append(f"{index}. {item.recipe_name}")
    warning = ""
    if safety_notes:
        warning = "\n\nPENTING: Kalau ada bau busuk, lendir, jamur, atau terlalu lama di suhu ruang, jangan dikonsumsi."
    if language == "en":
        return f"Temporary status: {_safety_label(safety_level, language)}\n\nRecipe ideas:\n" + "\n".join(lines) + "\n\nReply with the recipe number." + ("\n\nIMPORTANT: If it smells rotten, is slimy, moldy, or stayed too long at room temperature, do not eat it." if safety_notes else "")
    return f"Status sementara: {_safety_label(safety_level, language)}\n\nIde resep yang bisa dicoba:\n" + "\n".join(lines) + "\n\nBalas angka resep yang ingin dibuat." + warning


def _unsafe_reply(language: str, safety_notes: list[str]) -> str:
    reasons = safety_notes[:2] or ["Ada tanda makanan berisiko."]
    if language == "en":
        return "Based on your information, this food is risky and should not be consumed.\n\nReasons:\n" + "\n".join(f"- {_localize_step(item, language)}" for item in reasons) + "\n\nIf it is spoiled, slimy, or moldy, discard it safely."
    return "Dari informasi yang kamu berikan, makanan ini berisiko dan sebaiknya tidak dikonsumsi.\n\nAlasannya:\n" + "\n".join(f"- {_localize_step(item, language)}" for item in reasons) + "\n\nJika sudah basi, berlendir, atau berjamur, buang dengan aman. Kalau ragu, lebih aman jangan dikonsumsi."


def _unclear_reply(language: str) -> str:
    if language == "en":
        return "Please send a food photo or write the leftovers you have.\n\nExample: leftover rice, egg, sambal, spinach"
    return "Boleh kirim foto makanan atau tulis sisa makanan yang kamu punya.\n\nContoh: nasi sisa, telur, sambal, bayam"


def _image_failed_reply(language: str) -> str:
    if language == "en":
        return "Sorry, I could not read the photo clearly. Try a closer photo or write the ingredients."
    return "Maaf, foto belum bisa dibaca dengan jelas. Coba foto lebih dekat atau tulis bahan makanannya."


def _no_recipe_reply(language: str) -> str:
    if language == "en":
        return "I do not have a good recipe match yet. Try adding clearer ingredient names."
    return "Belum ada resep yang cocok. Coba tulis nama bahan dengan lebih jelas."


def _choose_number_reply(language: str) -> str:
    return "Choose a recipe number, for example 1 or 2." if language == "en" else "Pilih angka resep ya, misalnya 1 atau 2."


def _pdf_ready_reply(language: str, url: str) -> str:
    if language == "en":
        return f"Recipe PDF is ready:\n{url}\n\nRemember to check food condition before eating."
    return f"PDF resep sudah siap:\n{url}\n\nJangan lupa cek kondisi makanan sebelum dimakan ya."


def _pdf_failed_reply(language: str) -> str:
    return "Sorry, the PDF is not ready yet." if language == "en" else "Maaf, PDF belum bisa dibuat."


def _done_reply(language: str) -> str:
    if language == "en":
        return "Okay. If you have other leftovers, send a photo or write the ingredients again."
    return "Siap. Kalau ada sisa makanan lain, kirim foto atau tulis bahannya lagi ya."


def _safety_label(value: str, language: str) -> str:
    labels = {
        "eligible_with_freshness_check": ("Eligible after freshness check", "Layak setelah cek kesegaran"),
        "needs_user_review": ("Needs confirmation", "Butuh konfirmasi"),
        "not_safe_for_edible_reuse": ("Do not consume", "Jangan dikonsumsi"),
    }
    english, indonesia = labels.get(value, ("Needs confirmation", "Butuh konfirmasi"))
    return english if language == "en" else indonesia


def _clean_ingredient(value: str, language: str) -> str:
    text = str(value)
    text = re.sub(r"\s*-\s*(required|optional),?\s*leftover", "", text, flags=re.I)
    text = re.sub(r"\s*-\s*(required|optional)", "", text, flags=re.I)
    text = text.replace("optional:", "opsional:" if language == "id" else "optional:")
    replacements = {
        "egg": "telur",
        "leftover cooked rice": "nasi sisa",
        "leftover cooked vegetables": "sayur sisa",
        "leftover chicken": "ayam sisa",
        "stored sambal": "sambal",
        "shallot": "bawang merah",
        "garlic": "bawang putih",
    }
    if language == "id":
        for source, target in replacements.items():
            text = re.sub(source, target, text, flags=re.I)
    return text.strip()


def _short_safety_note(language: str, warnings: list[str]) -> str:
    if language == "en":
        return "Check smell, texture, color, storage time, and reheat until hot."
    return "Cek bau, tekstur, warna, waktu penyimpanan, dan panaskan sampai benar-benar panas."


def _localize_step(value: str, language: str) -> str:
    text = str(value)
    if language == "en":
        return text
    lowered = text.lower()
    exact = {
        "check all leftovers for safe storage and spoilage signs.": "Periksa semua leftover: pastikan penyimpanan aman dan tidak ada tanda basi.",
        "check that the rice and any leftover lauk are safe to reuse.": "Pastikan nasi dan lauk sisa masih aman untuk digunakan kembali.",
        "add leftover protein or vegetables and cook until hot.": "Masukkan protein atau sayuran sisa, lalu masak sampai panas.",
        "add rice, break up clumps, and stir-fry over medium-high heat.": "Masukkan nasi, uraikan gumpalan, lalu tumis dengan api sedang-besar.",
        "season with salt, kecap manis, sambal, or the listed spice base.": "Bumbui dengan garam, kecap manis, sambal, atau bumbu yang tersedia.",
        "cook until the rice is steaming hot, then serve immediately.": "Masak sampai nasi benar-benar panas dan beruap, lalu sajikan segera.",
    }
    if lowered in exact:
        return exact[lowered]
    return (
        text.replace("Check", "Periksa")
        .replace("leftovers", "leftover")
        .replace("safe storage", "penyimpanan aman")
        .replace("spoilage signs", "tanda basi")
        .replace("Serve immediately", "Sajikan segera")
        .replace("serve immediately", "sajikan segera")
        .replace("Heat", "Panaskan")
        .replace("heat", "panaskan")
        .replace("Cook", "Masak")
        .replace("cook", "masak")
    )
