import { AlertTriangle, BookOpen, HelpCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import SafetyBadge from "../components/SafetyBadge.jsx";
import { submitContactMessage } from "../api/contactApi";
import { useApp } from "../context/AppContext.jsx";

export default function Help() {
  const { language, user } = useApp();
  const copy = helpCopy[language] || helpCopy.id;
  const [topic, setTopic] = useState("question");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await submitContactMessage({
        user_id: user?.id || null,
        name: user?.name || "",
        email: user?.email || "",
        language,
        topic,
        message,
      });
      setMessage("");
      setStatus("sent");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-forest-900 p-6 text-white shadow-soft sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-food-yellow">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{copy.description}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <HelpCard icon={BookOpen} title={copy.howTitle} items={copy.howItems} />
        <HelpCard icon={ShieldCheck} title={copy.safetyTitle} items={copy.safetyItems} />
        <Card className="p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-2xl font-black text-forest-900">
            <HelpCircle size={24} /> {copy.contactTitle}
          </h2>
          <p className="mt-2 text-base leading-7 text-ink/65">{copy.contactText}</p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block text-sm font-black text-forest-900">
              {copy.topicLabel}
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-earth-50 px-4"
              >
                {copy.topicOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-black text-forest-900">
              {copy.messageLabel}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="focus-ring mt-2 min-h-32 w-full resize-y rounded-2xl border border-forest-900/10 bg-earth-50 px-4 py-3 text-base leading-7"
                placeholder={copy.messagePlaceholder}
              />
            </label>
            {status === "loading" && <LoadingState title={copy.sendingTitle} message={copy.sendingText} />}
            {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
            {status === "sent" && <div className="rounded-2xl bg-mint p-4 text-sm font-black text-forest-900">{copy.sentText}</div>}
            <Button type="submit" disabled={message.trim().length < 5 || status === "loading"} className="min-h-12 rounded-2xl">
              {copy.submitContact}
            </Button>
          </form>
        </Card>
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-2xl font-black text-forest-900">
            <AlertTriangle size={24} /> {copy.statusTitle}
          </h2>
          <div className="mt-4 grid gap-3">
            {copy.statuses.map((status) => (
              <div key={status.label} className="rounded-2xl bg-earth-50 p-4">
                <SafetyBadge level={status.level}>{status.label}</SafetyBadge>
                <p className="mt-2 text-base leading-7 text-ink/70">{status.text}</p>
              </div>
            ))}
          </div>
        </Card>
        <HelpCard icon={HelpCircle} title={copy.faqTitle} items={copy.faqItems} />
      </div>
    </div>
  );
}

function HelpCard({ icon: Icon, title, items }) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-2xl font-black text-forest-900">
        <Icon size={24} /> {title}
      </h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-earth-50 p-4 text-base font-semibold leading-7 text-ink/75">
            {item}
          </div>
        ))}
      </div>
    </Card>
  );
}

const helpCopy = {
  id: {
    eyebrow: "Bantuan",
    title: "Cara memakai FoodLoop",
    description: "Panduan singkat untuk memasukkan sisa makanan, cek keamanan, memilih resep, dan mengikuti langkah memasak.",
    howTitle: "Alur pemakaian",
    howItems: ["Tekan Mulai.", "Foto makanan, pilih dari galeri, atau tulis sendiri.", "Jawab cek keamanan singkat.", "Konfirmasi bahan yang terlihat.", "Pilih resep dan mulai masak."],
    safetyTitle: "Tips keamanan makanan",
    safetyItems: ["Jangan makan jika bau busuk atau asam.", "Jangan makan jika berlendir atau berjamur.", "Nasi jangan terlalu lama di suhu ruang.", "Jika ragu, lebih aman dibuang."],
    statusTitle: "Arti status keamanan",
    statuses: [
      { level: "safe", label: "Aman jika kondisi normal", text: "Bisa dipakai jika tidak ada tanda basi dan penyimpanan masuk akal." },
      { level: "review", label: "Butuh konfirmasi", text: "FoodLoop perlu info tambahan seperti waktu masak atau penyimpanan." },
      { level: "risk", label: "Risiko tinggi", text: "Ada faktor yang perlu sangat diwaspadai sebelum dimakan." },
      { level: "danger", label: "Jangan dikonsumsi", text: "Lebih aman dibuang atau dimanfaatkan non-konsumsi." },
    ],
    faqTitle: "Pertanyaan umum",
    faqItems: ["Apakah AI selalu benar? Tidak. Selalu cek bau, tekstur, warna, dan penyimpanan.", "Apakah bisa pakai foto buram? Bisa dicoba, tetapi tulis tambahan bahan jika AI melewatkan sesuatu.", "Apakah data dijual? Tidak. Data demo dipakai untuk fungsi produk dan analitik aplikasi."],
    contactTitle: "Hubungi FoodLoop",
    contactText: "Tulis pertanyaan, kendala, atau masukan. Pesan ini masuk ke panel admin dan bisa ditindaklanjuti oleh tim atau asisten AI.",
    topicLabel: "Topik",
    topicOptions: [
      { value: "question", label: "Pertanyaan umum" },
      { value: "bug", label: "Masalah aplikasi" },
      { value: "recipe", label: "Saran resep" },
      { value: "safety", label: "Keamanan makanan" },
    ],
    messageLabel: "Pesan",
    messagePlaceholder: "Contoh: Saya bingung kenapa resep tidak muncul untuk nasi sisa dan telur.",
    sendingTitle: "Mengirim pesan",
    sendingText: "Menyimpan pesan ke admin panel.",
    errorTitle: "Pesan belum terkirim",
    sentText: "Pesan berhasil dikirim. Terima kasih, kami akan meninjau dari panel admin.",
    submitContact: "Kirim pesan",
  },
  en: {
    eyebrow: "Help",
    title: "How to use FoodLoop",
    description: "A short guide for entering leftovers, checking safety, choosing recipes, and following cooking steps.",
    howTitle: "How it works",
    howItems: ["Tap Start.", "Take a photo, choose from gallery, or write it yourself.", "Answer the quick safety check.", "Confirm visible ingredients.", "Choose a recipe and cook."],
    safetyTitle: "Food safety tips",
    safetyItems: ["Do not eat food that smells rotten or sour.", "Do not eat food that is slimy or moldy.", "Rice should not stay too long at room temperature.", "When unsure, it is safer to discard."],
    statusTitle: "Safety statuses",
    statuses: [
      { level: "safe", label: "Safe if normal", text: "Usable if there are no spoilage signs and storage makes sense." },
      { level: "review", label: "Needs confirmation", text: "FoodLoop needs more info such as cooking time or storage." },
      { level: "risk", label: "High risk", text: "There are factors to check very carefully before eating." },
      { level: "danger", label: "Do not consume", text: "Safer to discard or use non-edible options." },
    ],
    faqTitle: "FAQ",
    faqItems: ["Is AI always right? No. Always check smell, texture, color, and storage.", "Can blurry photos work? You can try, but add missing ingredients manually.", "Is data sold? No. Demo data is used for product functionality and app analytics."],
    contactTitle: "Contact FoodLoop",
    contactText: "Send a question, issue, or suggestion. This message appears in the admin panel and can be followed up by the team or AI assistant.",
    topicLabel: "Topic",
    topicOptions: [
      { value: "question", label: "General question" },
      { value: "bug", label: "App issue" },
      { value: "recipe", label: "Recipe suggestion" },
      { value: "safety", label: "Food safety" },
    ],
    messageLabel: "Message",
    messagePlaceholder: "Example: I am not sure why recipes do not appear for leftover rice and egg.",
    sendingTitle: "Sending message",
    sendingText: "Saving your message to the admin panel.",
    errorTitle: "Message not sent",
    sentText: "Message sent. Thank you, we will review it from the admin panel.",
    submitContact: "Send message",
  },
};
