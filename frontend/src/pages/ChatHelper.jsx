import { Bot, Clock, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SafetyWarning from "../components/SafetyWarning.jsx";
import { sendChatMessage } from "../api/chatApi";
import { useApp } from "../context/AppContext.jsx";

export default function ChatHelper() {
  const { t, user, language } = useApp();
  const copy = chatCopy[language] || chatCopy.en;
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = location.state?.initialPrompt;
  const [input, setInput] = useState(initialPrompt || "");
  const [condition, setCondition] = useState("unknown");
  const [storage, setStorage] = useState("");
  const [timing, setTiming] = useState("");
  const [spoilage, setSpoilage] = useState("");
  const [specifics, setSpecifics] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  function buildPrompt(text) {
    return [
      text,
      "",
      `Kondisi umum: ${condition}`,
      `Kapan dimasak/dibeli: ${timing || "belum diisi"}`,
      `Penyimpanan: ${storage || "belum diisi"}`,
      `Tanda basi/kontaminasi: ${spoilage || "belum diisi"}`,
      `Diet/alergi/porsi/waktu masak: ${specifics || "belum diisi"}`,
    ].join("\n");
  }

  async function handleProcess(text = input) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const result = await sendChatMessage({
        user_id: user?.id || null,
        message: buildPrompt(trimmed),
        condition,
      });
      navigate(`/analysis/${result.analysis_id}`, {
        state: {
          assistantReply: stripMarkdown(result.reply),
          detectedLabels: result.detected_labels,
        },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="AI Assistant" title={t.chatTitle} description={copy.pageDescription} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-forest-50 text-forest-700">
                <Bot size={22} />
              </span>
              <div>
                <h2 className="font-bold text-forest-900">{copy.intakeTitle}</h2>
                <p className="text-sm text-ink/60">{copy.intakeDescription}</p>
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold text-forest-900">
              {copy.leftoverDetails}
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="focus-ring mt-2 min-h-40 w-full resize-y rounded-lg border border-forest-900/10 bg-earth-50 px-4 py-3 text-sm"
                placeholder={copy.mainPlaceholder}
              />
            </label>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <CompactField label={copy.timingLabel} value={timing} onChange={setTiming} placeholder={copy.timingPlaceholder} />
              <CompactField label={copy.storageLabel} value={storage} onChange={setStorage} placeholder={copy.storagePlaceholder} />
              <CompactField label={copy.spoilageLabel} value={spoilage} onChange={setSpoilage} placeholder={copy.spoilagePlaceholder} />
              <CompactField label={copy.specificsLabel} value={specifics} onChange={setSpecifics} placeholder={copy.specificsPlaceholder} />
            </div>

            {error && <ErrorState title={copy.errorTitle} message={error} />}
            {isSending && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" onClick={() => handleProcess()} disabled={!input.trim() || isSending}>
                <Send size={18} />
                {copy.processButton}
              </Button>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            {copy.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="focus-ring rounded-lg border border-forest-900/10 bg-white px-3 py-3 text-left text-sm leading-6 text-ink/70 shadow-soft hover:bg-forest-50"
              >
                {prompt}
              </button>
            ))}
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <h2 className="font-bold text-forest-900">{copy.safetyContext}</h2>
            <label className="mt-4 block text-sm font-semibold text-forest-900">
              {copy.conditionLabel}
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="focus-ring mt-1 w-full rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-2 text-sm"
              >
                {copy.conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </section>

          <SafetyWarning>
            {copy.safetyWarning}
          </SafetyWarning>

          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 font-bold text-forest-900">
              <ShieldCheck size={18} />
              {copy.safetyGuard}
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/65">
              {copy.safetyBullets.map((item, index) => (
                <li key={item} className={index === 0 ? "flex gap-2" : ""}>
                  {index === 0 && <Clock size={15} className="mt-1 shrink-0" />}
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold text-forest-900">
              <Sparkles size={18} />
              {copy.betterInputTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">
              {copy.betterInputText}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

const chatCopy = {
  en: {
    pageDescription: "Clarify the important details first, then FoodLoop will process it into the normal analysis and recipe flow.",
    intakeTitle: "Leftover intake",
    intakeDescription: "Give the AI enough context so it can answer directly instead of asking follow-up questions.",
    leftoverDetails: "Leftover details",
    mainPlaceholder: "Example: white rice, fried chicken, sambal, stir-fried vegetables. Make 2 portions, not too spicy.",
    timingLabel: "When was it cooked/bought?",
    timingPlaceholder: "Example: last night at 20:00",
    storageLabel: "Where was it stored?",
    storagePlaceholder: "Example: covered in the fridge",
    spoilageLabel: "Any spoilage signs?",
    spoilagePlaceholder: "Example: no smell, no slime",
    specificsLabel: "Diet/allergy/servings/time",
    specificsPlaceholder: "Example: 2 portions, 20 minutes, seafood allergy",
    errorTitle: "Chat backend error",
    loadingTitle: "Processing leftover",
    loadingMessage: "Creating analysis, checking safety, and matching Indonesian recipes.",
    processButton: "Process and view analysis",
    quickPrompts: [
      "I have rice, egg, sambal, and leftover chicken stored in the fridge since last night.",
      "Restaurant leftover: fried chicken and rice, left at room temperature for 5 hours.",
      "I have tempeh, tofu, cabbage, and sambal.",
      "Leftover rice from last night in the fridge, want a fast breakfast.",
    ],
    safetyContext: "Safety context",
    conditionLabel: "General condition",
    conditionOptions: [
      { value: "unknown", label: "Not sure yet" },
      { value: "fresh", label: "Fresh" },
      { value: "refrigerated", label: "In the fridge" },
      { value: "spoiled", label: "Spoilage signs" },
      { value: "contaminated", label: "Contaminated" },
    ],
    safetyWarning: "If there is a rotten smell, slime, mold, color change, or food left too long at room temperature, FoodLoop will prioritize safety-first advice.",
    safetyGuard: "Safety guard",
    safetyBullets: [
      "Room temperature for more than 2 hours is usually risky.",
      "Rice and pasta should not be reheated repeatedly.",
      "Reheat until steaming hot, around 74 C.",
    ],
    betterInputTitle: "Better input",
    betterInputText: "The more you clarify storage, timing, and spoilage signs here, the less the AI needs to ask later.",
  },
  id: {
    pageDescription: "Perjelas detail penting terlebih dahulu, lalu FoodLoop akan memprosesnya ke alur analisis dan resep.",
    intakeTitle: "Input leftover",
    intakeDescription: "Beri AI konteks yang cukup agar bisa langsung menjawab tanpa banyak pertanyaan lanjutan.",
    leftoverDetails: "Detail leftover",
    mainPlaceholder: "Contoh: nasi putih, ayam goreng, sambal, sayur tumis. Mau dibuat 2 porsi, tidak terlalu pedas.",
    timingLabel: "Kapan dimasak/dibeli?",
    timingPlaceholder: "Contoh: semalam jam 20.00",
    storageLabel: "Disimpan di mana?",
    storagePlaceholder: "Contoh: kulkas, tertutup",
    spoilageLabel: "Ada tanda basi?",
    spoilagePlaceholder: "Contoh: tidak bau, tidak berlendir",
    specificsLabel: "Diet/alergi/porsi/waktu",
    specificsPlaceholder: "Contoh: 2 porsi, 20 menit, alergi seafood",
    errorTitle: "Error backend chat",
    loadingTitle: "Memproses leftover",
    loadingMessage: "Membuat analisis, mengecek keamanan, dan mencocokkan resep Indonesia.",
    processButton: "Proses dan lihat analisis",
    quickPrompts: [
      "Saya punya nasi, telur, sambal, dan ayam sisa di kulkas sejak tadi malam.",
      "Leftover restoran: ayam goreng dan nasi, sudah 5 jam di suhu ruang.",
      "Saya punya tempe, tahu, kol, dan sambal.",
      "Nasi sisa dari kemarin malam di kulkas, mau dibuat sarapan cepat.",
    ],
    safetyContext: "Konteks keamanan",
    conditionLabel: "Kondisi umum",
    conditionOptions: [
      { value: "unknown", label: "Belum yakin" },
      { value: "fresh", label: "Segar" },
      { value: "refrigerated", label: "Di kulkas" },
      { value: "spoiled", label: "Ada tanda basi" },
      { value: "contaminated", label: "Terkontaminasi" },
    ],
    safetyWarning: "Kalau ada bau busuk, lendir, jamur, warna berubah, atau makanan terlalu lama di suhu ruang, FoodLoop akan mengutamakan keamanan.",
    safetyGuard: "Penjaga keamanan",
    safetyBullets: [
      "Suhu ruang lebih dari 2 jam biasanya berisiko.",
      "Nasi dan pasta jangan dipanaskan berulang.",
      "Panaskan ulang sampai beruap panas, sekitar 74 C.",
    ],
    betterInputTitle: "Input lebih baik",
    betterInputText: "Semakin jelas penyimpanan, waktu, dan tanda basi yang Anda tulis, semakin sedikit pertanyaan lanjutan dari AI.",
  },
};

function CompactField({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm font-semibold text-forest-900">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-1 w-full rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-2 text-sm"
        placeholder={placeholder}
      />
    </label>
  );
}

function stripMarkdown(text = "") {
  return text.replace(/\*\*/g, "").replace(/\*/g, "");
}
