from __future__ import annotations

import base64
import json
from pathlib import Path

from app.core.config import settings


leftover_schema = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "display_name": {"type": "string"},
                    "confidence": {"type": "number"},
                    "is_safety_flag": {"type": "boolean"},
                },
                "required": ["label", "display_name", "confidence", "is_safety_flag"],
                "additionalProperties": False,
            },
        },
        "safety_notes": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": ["items", "safety_notes"],
    "additionalProperties": False,
}


def openai_is_configured() -> bool:
    return bool(settings.openai_api_key)


def analyze_leftover_text_with_openai(text: str) -> tuple[list[dict], list[str]]:
    client = _client()
    response = client.responses.create(
        model=settings.openai_text_model,
        instructions=_analysis_instructions(),
        input=f"Analyze these leftover foods and return only structured JSON: {text}",
        text={
            "format": {
                "type": "json_schema",
                "name": "leftover_analysis",
                "strict": True,
                "schema": leftover_schema,
            }
        },
    )
    return _parse_leftover_response(response.output_text, source="openai_text")


def analyze_leftover_image_with_openai(image_path: str) -> tuple[list[dict], list[str]]:
    client = _client()
    data_url = _image_to_data_url(image_path)
    response = client.responses.create(
        model=settings.openai_vision_model,
        instructions=_analysis_instructions(),
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Identify visible leftover foods. Image quality may be low. Return only structured JSON.",
                    },
                    {
                        "type": "input_image",
                        "image_url": data_url,
                    },
                ],
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "leftover_image_analysis",
                "strict": True,
                "schema": leftover_schema,
            }
        },
    )
    return _parse_leftover_response(response.output_text, source="openai_vision")


def generate_openai_reply(message: str, detected_labels: list[str], recommendation_names: list[str]) -> str:
    client = _client()
    response = client.responses.create(
        model=settings.openai_text_model,
        instructions=_advisor_instructions(),
        input=(
            "Data dari aplikasi:\n"
            f"- Pesan user: {message}\n"
            f"- Label leftover terdeteksi: {detected_labels}\n"
            f"- Menu Indonesia yang boleh direkomendasikan dari database/JSON: {recommendation_names}\n\n"
            "Jawab dalam bahasa Indonesia. Jangan meminta checklist panjang. "
            "Tanyakan hanya 2-3 pertanyaan keamanan paling penting yang belum terjawab. "
            "Tetap beri ide sementara jika makanan mungkin masih aman. "
            "Gunakan teks biasa dan bullet tanda minus, jangan pakai asterisk markdown."
        ),
    )
    return response.output_text


def _advisor_instructions() -> str:
    return """
You are FoodLoop AI, a friendly Indonesian leftover assistant. Your mission is to help users turn leftovers into safe, practical, low-waste meals or non-edible reuse ideas when the food is no longer safe to eat.

Speak in natural, friendly, practical Indonesian. Do not sound like a hospital form or legal document. Be concise, useful, and safety-aware.

Core behavior:
- When the user describes leftovers, do not immediately demand a long checklist.
- First understand the items, then give a useful response.
- Always acknowledge the leftovers, extract detected items, give a quick safety status, ask only the 2-3 most important missing safety questions, give 2-4 provisional recipe ideas if the food might still be safe, and end with a simple next step.
- Never ask for all missing data at once unless the user explicitly asks for a full safety audit.

Safety labels:
1. AMAN JIKA KONDISI NORMAL
2. BUTUH KONFIRMASI
3. RISIKO TINGGI
4. JANGAN DIKONSUMSI

Only ask the most relevant 2-3 questions from:
- Kapan makanan ini dimasak/dibeli?
- Sejak itu disimpan di kulkas, freezer, atau suhu ruang?
- Ada bau asam/busuk, lendir, jamur, atau warna berubah?
- Untuk nasi/pasta: sudah berapa lama sejak matang dan sudah pernah dipanaskan ulang belum?
- Ada alergi, pantangan makanan, atau batasan diet?
- Mau dibuat berapa porsi dan punya waktu masak berapa menit?

Food safety rules:
- If leftovers were left at room temperature for more than 2 hours, recommend not eating them.
- If the room was very hot, around above 32 C, use a stricter 1-hour limit.
- If cooked leftovers were refrigerated properly at around 4 C or below and are less than 4 days old, they are usually usable if there are no spoilage signs.
- If cooked leftovers are more than 4 days old in the fridge, mark as higher risk.
- Reheated leftovers should be heated until steaming hot, ideally around 74 C internal temperature.
- Do not suggest eating food that smells sour/rotten, has mold, is slimy, has abnormal color, or was contaminated.
- Be extra careful with rice, pasta, meat, fish, eggs, dairy, coconut milk/santan, and cooked spinach/sayur matang.
- For rice and pasta, warn against long room-temperature storage and repeated reheating.
- If food is unsafe for humans, switch to compost/eco-enzyme/safe disposal suggestions when relevant.

Output format:
1. Short friendly opening.
2. "Yang aku tangkap:" with detected items.
3. "Status keamanan sementara:" with one safety label and short explanation.
4. "Aku perlu cek 2-3 hal dulu:" with only the most important questions.
5. "Ide yang bisa dibuat kalau masih aman:" with 2-4 ideas.
6. For each idea: title, short description, estimated time, 3-5 short steps, safety note.
7. "Kalau ternyata tidak aman:" with compost/eco-enzyme/disposal option if relevant.
8. Simple next action.

Style rules:
- Use friendly Indonesian.
- Use plain text and hyphen bullets. Do not use markdown asterisks.
- Do not use too much formal wording like "data wajib belum lengkap."
- Do not overwhelm the user.
- Do not ask 10+ questions in one response.
- Do not provide false certainty.
- Use "sementara" when safety data is incomplete.
- Use bold "PENTING:" only when there is a real food-safety risk.
- Keep answers practical and short enough for mobile/chatbot use.

Nutrition:
- When giving recipes, include simple approximate nutrition only if possible: rough calories, protein, and fiber.
- If uncertain, say: "Estimasi gizi kasar karena jumlah bahan belum pasti."

Recipe priority:
1. Using leftovers safely.
2. Minimizing additional ingredients.
3. Indonesian household recipes.
4. Fast cooking time.
5. Reducing waste.
"""


def _client():
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")
    from openai import OpenAI

    return OpenAI(api_key=settings.openai_api_key)


def _analysis_instructions() -> str:
    return (
        "You identify leftover food for an Indonesian food-reuse app. "
        "Use normalized labels from the app taxonomy such as cooked_rice, egg, vegetable_leftover, "
        "chicken_leftover, fish_leftover, beef_leftover, tofu_leftover, tempeh_leftover, sambal, "
        "coconut_milk_dish_leftover, noodles_leftover, bread_leftover, cassava_leftover, banana_overripe, "
        "corn_leftover, potato_leftover, lontong_ketupat_leftover, spice_paste_leftover, "
        "grated_coconut_leftover, unknown_food_leftover, "
        "unsafe_spoilage_sign. If food looks or sounds spoiled, moldy, slimy, contaminated, or unsafe, "
        "mark is_safety_flag true and add a safety note. Do not invent safety certainty."
    )


def _parse_leftover_response(output_text: str, source: str) -> tuple[list[dict], list[str]]:
    payload = json.loads(output_text)
    items = []
    for item in payload.get("items", []):
        items.append(
            {
                "label": item["label"],
                "display_name": item["display_name"],
                "confidence": float(item.get("confidence", 0.7)),
                "source": source,
                "is_safety_flag": bool(item.get("is_safety_flag", False)),
            }
        )
    return items, list(payload.get("safety_notes", []))


def _image_to_data_url(image_path: str) -> str:
    path = Path(image_path)
    suffix = path.suffix.lower()
    mime_type = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(suffix, "image/jpeg")
    encoded = base64.b64encode(path.read_bytes()).decode("utf-8")
    return f"data:{mime_type};base64,{encoded}"
