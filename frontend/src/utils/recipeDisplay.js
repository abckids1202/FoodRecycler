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
  stock: "kaldu",
  ginger: "jahe",
  "green onion": "daun bawang",
  scallion: "daun bawang",
  "fried shallot": "bawang goreng",
  "fried shallots": "bawang goreng",
  "soy sauce": "kecap",
  "sweet soy sauce": "kecap manis",
  "pot, ladle": "panci, sendok sayur",
  pot: "panci",
  ladle: "sendok sayur",
  "pan or pot": "wajan atau panci",
  stove: "kompor",
  knife: "pisau",
  "cutting board": "talenan",
};

const safetyLabels = {
  eligible_with_fresh: { en: "Eligible if fresh", id: "Layak jika bahan segar" },
  eligible_with_freshness_check: { en: "Eligible after freshness check", id: "Layak setelah cek kesegaran" },
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
  "check all leftovers for safe storage and spoilage signs.": "Periksa semua leftover: pastikan penyimpanan aman dan tidak ada tanda basi.",
  "check all leftovers for safe storage and spoilage signs": "Periksa semua leftover: pastikan penyimpanan aman dan tidak ada tanda basi.",
  "check the leftover base and discard anything unsafe.": "Periksa bahan leftover utama dan buang apa pun yang tidak aman.",
  "check the leftover base and discard anything unsafe": "Periksa bahan leftover utama dan buang apa pun yang tidak aman.",
  "check that the rice and any leftover lauk are safe to reuse.": "Pastikan nasi dan lauk sisa masih aman untuk digunakan kembali.",
  "check that the rice and any leftover lauk are safe to reuse": "Pastikan nasi dan lauk sisa masih aman untuk digunakan kembali.",
  "add leftover protein or vegetables and cook until hot.": "Masukkan protein atau sayuran sisa, lalu masak sampai panas.",
  "add leftover protein or vegetables and cook until hot": "Masukkan protein atau sayuran sisa, lalu masak sampai panas.",
  "add rice, break up clumps, and stir-fry over medium-high heat.": "Masukkan nasi, uraikan gumpalan, lalu tumis dengan api sedang-besar.",
  "add rice, break up clumps, and stir-fry over medium-high heat": "Masukkan nasi, uraikan gumpalan, lalu tumis dengan api sedang-besar.",
  "season with salt, kecap manis, sambal, or the listed spice base.": "Bumbui dengan garam, kecap manis, sambal, atau bumbu yang tersedia.",
  "season with salt, kecap manis, sambal, or the listed spice base": "Bumbui dengan garam, kecap manis, sambal, atau bumbu yang tersedia.",
  "cook until the rice is steaming hot, then serve immediately.": "Masak sampai nasi benar-benar panas dan beruap, lalu sajikan segera.",
  "cook until the rice is steaming hot, then serve immediately": "Masak sampai nasi benar-benar panas dan beruap, lalu sajikan segera.",
  "mash, shred, or chop the main ingredient so it mixes evenly.": "Haluskan, suwir, atau potong bahan utama agar tercampur merata.",
  "combine with seasoning, egg or starch if needed, and fresh aromatics.": "Campurkan dengan bumbu, telur atau pati jika perlu, serta bumbu aromatik segar.",
  "shape into small pieces so the inside cooks evenly.": "Bentuk menjadi bagian kecil agar bagian dalam matang merata.",
  "fry or cook until the outside is crisp and the inside is hot.": "Goreng atau masak sampai bagian luar renyah dan bagian dalam panas.",
  "drain briefly and serve while warm.": "Tiriskan sebentar dan sajikan selagi hangat.",
  "drain briefly and serve while warm": "Tiriskan sebentar dan sajikan selagi hangat.",
  "bring broth, water, or spice base to a simmer.": "Didihkan perlahan kaldu, air, atau bumbu dasar.",
  "bring broth, water, or spice base to a simmer": "Didihkan perlahan kaldu, air, atau bumbu dasar.",
  "add harder vegetables first, then leftover protein or softer ingredients.": "Masukkan sayuran yang lebih keras lebih dulu, lalu protein sisa atau bahan yang lebih lunak.",
  "add harder vegetables first, then leftover protein or softer ingredients": "Masukkan sayuran yang lebih keras lebih dulu, lalu protein sisa atau bahan yang lebih lunak.",
  "simmer until everything is hot throughout.": "Masak perlahan sampai semua bahan benar-benar panas.",
  "simmer until everything is hot throughout": "Masak perlahan sampai semua bahan benar-benar panas.",
  "adjust seasoning and add fresh garnish just before serving.": "Sesuaikan rasa dan tambahkan garnish segar tepat sebelum disajikan.",
  "adjust seasoning and add fresh garnish just before serving": "Sesuaikan rasa dan tambahkan garnish segar tepat sebelum disajikan.",
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
  if (lower.startsWith("check all leftovers for safe storage")) {
    return "Periksa semua leftover: pastikan penyimpanan aman dan tidak ada tanda basi.";
  }
  if (lower.startsWith("heat oil and")) {
    return "Panaskan minyak, lalu tumis bawang, cabai, atau bumbu sampai harum.";
  }
  if (lower.startsWith("check the leftover base")) {
    return "Periksa bahan leftover utama dan buang apa pun yang tidak aman.";
  }
  if (lower.startsWith("mash, shred, or chop")) {
    return "Haluskan, suwir, atau potong bahan utama agar tercampur merata.";
  }
  if (lower.startsWith("combine with seasoning")) {
    return "Campurkan dengan bumbu, telur atau pati jika perlu, serta bumbu aromatik segar.";
  }
  if (lower.startsWith("shape into small pieces")) {
    return "Bentuk menjadi bagian kecil agar bagian dalam matang merata.";
  }
  if (lower.startsWith("fry or cook until")) {
    return "Goreng atau masak sampai bagian luar renyah dan bagian dalam panas.";
  }
  if (lower.startsWith("drain briefly")) {
    return "Tiriskan sebentar dan sajikan selagi hangat.";
  }
  if (lower.startsWith("bring broth")) {
    return "Didihkan perlahan kaldu, air, atau bumbu dasar.";
  }
  if (lower.startsWith("add harder vegetables")) {
    return "Masukkan sayuran yang lebih keras lebih dulu, lalu protein sisa atau bahan yang lebih lunak.";
  }
  if (lower.startsWith("simmer until")) {
    return "Masak perlahan sampai semua bahan benar-benar panas.";
  }
  if (lower.startsWith("adjust seasoning")) {
    return "Sesuaikan rasa dan tambahkan garnish segar tepat sebelum disajikan.";
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
  const name = localizeFoodPhrase(parsed.name, "id")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(sisa|leftover|opsional|wajib|required|optional)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (name.includes("nasi")) return "nasi";
  if (name.includes("telur")) return "telur";
  if (name.includes("sayur")) return "sayur";
  if (name.includes("ayam")) return "ayam";
  if (name.includes("tahu")) return "tahu";
  if (name.includes("tempe")) return "tempe";
  if (name.includes("sambal")) return "sambal";
  if (name.includes("kaldu")) return "kaldu";
  if (name.includes("jahe")) return "jahe";
  if (name.includes("daun bawang")) return "daun-bawang";
  if (name.includes("bawang goreng")) return "bawang-goreng";
  if (name.includes("kecap")) return "kecap";
  if (name.includes("kol")) return "kol";
  if (name.includes("bawang putih")) return "bawang-putih";
  if (name.includes("bawang merah")) return "bawang-merah";
  if (name.includes("wortel")) return "wortel";
  if (name.includes("lada")) return "lada";
  if (name.includes("panci") || name.includes("sendok sayur")) return "alat-masak";
  if (name.includes("porsi")) return "porsi";
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
    .replace(/\bstock\b/gi, "kaldu")
    .replace(/\bginger\b/gi, "jahe")
    .replace(/\bgreen onion\b/gi, "daun bawang")
    .replace(/\bscallion\b/gi, "daun bawang")
    .replace(/\bfried shallots?\b/gi, "bawang goreng")
    .replace(/\bsweet soy sauce\b/gi, "kecap manis")
    .replace(/\bsoy sauce\b/gi, "kecap")
    .replace(/\bpot\b/gi, "panci")
    .replace(/\bladle\b/gi, "sendok sayur")
    .replace(/\bknife\b/gi, "pisau")
    .replace(/\bcutting board\b/gi, "talenan")
    .replace(/\bstove\b/gi, "kompor")
    .replace(/\bpan or pot\b/gi, "wajan atau panci")
    .replace(/\bpieces\b/gi, "butir")
    .replace(/\bcup\b/gi, "cup")
    .replace(/fried bawang merah/gi, "bawang goreng");
}

function formatIngredient(item, language) {
  if (item.isTool) return language === "id" ? `Alat: ${item.name}` : `Tools: ${item.name}`;
  if (item.isServing) return language === "id" ? `Perkiraan porsi: ${item.name}` : `Estimated servings: ${item.name}`;
  return item.name;
}

function tidyLocalizedSentence(value) {
  const text = value.replace(/\s+/g, " ").replace(/\s+\./g, ".").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
