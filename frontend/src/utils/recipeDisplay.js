const itemTranslations = {
  "assorted vegetables (cabbage, peppers, lettuce, greens)": "sayuran campur",
  "eggs in carton": "telur",
  "cheese/dairy block and milk/yogurt bottles": "keju atau susu",
  "red fruit/berries in bowl": "buah merah atau beri",
  egg: "telur",
  eggs: "telur",
  garlic: "bawang putih",
  shallot: "bawang merah",
  cabbage: "kol",
  carrot: "wortel",
  pepper: "lada",
  "pan or pot": "wajan atau panci",
  stove: "kompor",
  knife: "pisau",
  "cutting board": "talenan",
};

const safetyLabels = {
  eligible_with_fresh: { en: "Eligible if fresh", id: "Layak jika bahan segar" },
  needs_review: { en: "Needs review", id: "Perlu dikonfirmasi" },
  needs_user_review: { en: "Needs review", id: "Perlu dikonfirmasi" },
  not_safe_for_edible_reuse: { en: "Do not consume", id: "Jangan dikonsumsi" },
  safe: { en: "Safe if normal", id: "Aman jika kondisi normal" },
  checked: { en: "Checked", id: "Sudah dicek" },
};

const difficultyLabels = {
  easy: { en: "Easy", id: "Mudah" },
  medium: { en: "Medium", id: "Sedang" },
  hard: { en: "Hard", id: "Sulit" },
  mvp: { en: "MVP", id: "MVP" },
};

const exactNoteTranslations = {
  "serve hot and avoid repeated reheating.": "Sajikan selagi panas dan hindari memanaskan ulang berkali-kali.",
  "serve hot and avoid repeated reheating": "Sajikan selagi panas dan hindari memanaskan ulang berkali-kali.",
  "serve hot and do not repeatedly cool and reheat.": "Sajikan selagi panas dan jangan mendinginkan lalu memanaskan ulang berkali-kali.",
  "serve hot and do not repeatedly cool and reheat": "Sajikan selagi panas dan jangan mendinginkan lalu memanaskan ulang berkali-kali.",
  "serve immediately.": "Sajikan segera.",
  "serve immediately": "Sajikan segera.",
  "heat until steaming hot.": "Panaskan hingga benar-benar panas dan beruap.",
  "heat until steaming hot": "Panaskan hingga benar-benar panas dan beruap.",
  "cook until fully set.": "Masak hingga matang sempurna.",
  "cook until fully set": "Masak hingga matang sempurna.",
};

const notePhraseTranslations = [
  [/\bserve hot\b/gi, "sajikan selagi panas"],
  [/\bserve immediately\b/gi, "sajikan segera"],
  [/\bavoid repeated reheating\b/gi, "hindari memanaskan ulang berkali-kali"],
  [/\bdo not repeatedly cool and reheat\b/gi, "jangan mendinginkan lalu memanaskan ulang berkali-kali"],
  [/\brepeated reheating\b/gi, "pemanasan ulang berkali-kali"],
  [/\breheat only once\b/gi, "panaskan ulang satu kali saja"],
  [/\bheat until steaming hot\b/gi, "panaskan hingga benar-benar panas dan beruap"],
  [/\bheat\b/gi, "panaskan"],
  [/\bcook until fully set\b/gi, "masak hingga matang sempurna"],
  [/\bcook until\b/gi, "masak hingga"],
  [/\bcook\b/gi, "masak"],
  [/\bstir-fry\b/gi, "tumis"],
  [/\bstir fry\b/gi, "tumis"],
  [/\bstir\b/gi, "aduk"],
  [/\bsaute\b/gi, "tumis"],
  [/\bsauté\b/gi, "tumis"],
  [/\badd\b/gi, "tambahkan"],
  [/\bmix\b/gi, "campurkan"],
  [/\bseason\b/gi, "bumbui"],
  [/\bserve\b/gi, "sajikan"],
  [/\beggs?\b/gi, "telur"],
  [/\bvegetables\b/gi, "sayuran"],
  [/\bgarlic\b/gi, "bawang putih"],
  [/\bshallot\b/gi, "bawang merah"],
  [/\bcabbage\b/gi, "kol"],
  [/\bcarrot\b/gi, "wortel"],
  [/\bpepper\b/gi, "lada"],
];

export function localizeRecipeValue(value, language) {
  if (!value) return value;
  const key = String(value).toLowerCase();
  return safetyLabels[key]?.[language] || difficultyLabels[key]?.[language] || value;
}

export function localizeRecipeNote(note, language) {
  if (language !== "id" || !note) return note;
  const text = String(note).trim();
  const lower = text.toLowerCase();

  if (exactNoteTranslations[lower]) {
    return exactNoteTranslations[lower];
  }
  if (lower.startsWith("inspect all leftovers first")) {
    return "Periksa semua leftover terlebih dahulu; buang jika berbau asam, berlendir, berjamur, berubah warna tidak wajar, atau terlalu lama tidak disimpan di kulkas.";
  }
  if (lower.startsWith("cook egg until fully set")) {
    return "Masak telur hingga matang sempurna, kecuali resep langsung disajikan dan panduan keamanan pangan memperbolehkannya.";
  }
  if (lower.startsWith("storage: best eaten immediately")) {
    return "Penyimpanan: paling baik dimakan segera setelah dimasak.";
  }
  if (lower.startsWith("storage: refrigerate any newly cooked leftovers")) {
    return "Penyimpanan: simpan sisa makanan baru di kulkas dalam 2 jam dan panaskan ulang satu kali saja jika memungkinkan.";
  }
  if (lower.startsWith("nutrition tags:")) {
    return `Tag gizi: ${text.split(":").slice(1).join(":").trim().replace("vegetables", "sayuran")}`;
  }
  if (lower.startsWith("source note:")) {
    return "Catatan sumber: sumber mendukung pola hidangan dan bahan. Penggunaan leftover adalah adaptasi praktis jika bahan tersimpan dengan aman.";
  }
  if (lower.includes("confirm freshness and storage before cooking")) {
    return "Pastikan kesegaran dan cara penyimpanan aman sebelum memasak.";
  }

  const translated = notePhraseTranslations.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
  return translated !== text ? tidyLocalizedSentence(translated) : text;
}

export function localizeIngredient(rawItem, language) {
  const parsed = parseIngredient(rawItem);
  const localizedName = localizeFoodPhrase(parsed.name, language);
  if (language !== "id") return formatIngredient({ ...parsed, name: localizedName }, "en");
  return formatIngredient({ ...parsed, name: localizedName }, "id");
}

export function normalizeIngredientKey(rawItem) {
  const parsed = parseIngredient(rawItem);
  const name = localizeFoodPhrase(parsed.name, "id").toLowerCase();
  if (name.includes("telur")) return "telur";
  if (name.includes("sayur")) return "sayur";
  if (name.includes("kol")) return "kol";
  if (name.includes("bawang putih")) return "bawang-putih";
  if (name.includes("bawang merah")) return "bawang-merah";
  if (name.includes("wortel")) return "wortel";
  if (name.includes("lada")) return "lada";
  return name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
}

export function parseIngredient(rawItem) {
  const original = String(rawItem || "").trim();
  const lower = original.toLowerCase();
  const isOptional = lower.startsWith("optional:") || lower.includes(" - optional") || lower.includes(", optional");
  const isTool = lower.startsWith("tools:");
  const isServing = lower.startsWith("estimated servings:");
  const isRequired = lower.includes("required") || (!isOptional && !isTool && !isServing);

  let name = original
    .replace(/^optional:\s*/i, "")
    .replace(/^tools:\s*/i, "")
    .replace(/^estimated servings:\s*/i, "")
    .replace(/\s*-\s*(required|optional),?\s*leftover/gi, "")
    .replace(/\s*-\s*(required|optional)/gi, "")
    .replace(/,\s*(required|optional),?\s*leftover/gi, "")
    .trim();

  return { original, name, isOptional, isRequired, isTool, isServing };
}

export function buildCookingMaterials(detail, language) {
  const detected = (detail?.detected_leftovers || []).map((item) => ({
    raw: item,
    label: localizeIngredient(item, language),
    required: false,
    source: "detected",
  }));

  const ingredients = (detail?.recipe?.ingredients || []).map((item) => {
    const parsed = parseIngredient(item);
    return {
      raw: item,
      label: localizeIngredient(item, language),
      required: parsed.isRequired && !parsed.isOptional && !parsed.isTool && !parsed.isServing,
      source: parsed.isOptional ? "optional" : parsed.isTool ? "tool" : parsed.isServing ? "serving" : "ingredient",
    };
  });

  const bestByKey = new Map();
  [...detected, ...ingredients].forEach((item) => {
    const key = normalizeIngredientKey(item.raw);
    const existing = bestByKey.get(key);
    if (!existing || Number(item.required) > Number(existing.required) || item.source === "ingredient") {
      bestByKey.set(key, item);
    }
  });

  return [...bestByKey.values()].filter((item) => item.label);
}

function localizeFoodPhrase(value, language) {
  const cleaned = String(value || "").trim();
  if (language !== "id") return cleaned;

  const lower = cleaned.toLowerCase();
  if (itemTranslations[lower]) return itemTranslations[lower];

  return cleaned
    .replace(/\beggs?\b/gi, "telur")
    .replace(/\bgarlic\b/gi, "bawang putih")
    .replace(/\bshallot\b/gi, "bawang merah")
    .replace(/\bcabbage\b/gi, "kol")
    .replace(/\bcarrot\b/gi, "wortel")
    .replace(/\bpepper\b/gi, "lada")
    .replace(/\bknife\b/gi, "pisau")
    .replace(/\bcutting board\b/gi, "talenan")
    .replace(/\bstove\b/gi, "kompor")
    .replace(/\bpan or pot\b/gi, "wajan atau panci")
    .replace(/\bpieces\b/gi, "butir")
    .replace(/\bcup\b/gi, "cup");
}

function formatIngredient(item, language) {
  if (item.isTool) return language === "id" ? `Alat: ${item.name}` : `Tools: ${item.name}`;
  if (item.isServing) return language === "id" ? `Perkiraan porsi: ${item.name}` : `Estimated servings: ${item.name}`;
  if (item.isOptional) return language === "id" ? `${item.name} (opsional)` : `${item.name} (optional)`;
  if (item.original.toLowerCase().includes("required")) return language === "id" ? `${item.name} (wajib)` : `${item.name} (required)`;
  return item.name;
}

function tidyLocalizedSentence(value) {
  const text = value.replace(/\s+/g, " ").replace(/\s+\./g, ".").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
