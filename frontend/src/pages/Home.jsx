import { BarChart3, Bot, Camera, ChevronRight, Clock, FileText, Search, ShieldCheck, Sparkles, Upload, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function Home() {
  const { t, language } = useApp();
  const copy = homeCopy[language] || homeCopy.en;
  const [activeRecipe, setActiveRecipe] = useState(0);
  const steps = [
    { title: t.stepShareTitle, text: t.stepShareText },
    { title: t.stepDetectTitle, text: t.stepDetectText },
    { title: t.stepMatchTitle, text: t.stepMatchText },
    { title: t.stepSaveTitle, text: t.stepSaveText },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRecipe((current) => (current + 1) % copy.sliderRecipes.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [copy.sliderRecipes.length]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-lg bg-forest-900 text-white shadow-soft">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-forest-100">
              FoodLoop AI
            </p>
            <h1 className="mt-4 max-w-3xl text-[2rem] font-bold leading-tight tracking-normal sm:text-5xl">
              {t.homeHeroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
              {t.homeHeroDescription}
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button as={Link} to="/upload" className="w-full bg-earth-500 text-white shadow-lg shadow-black/10 hover:bg-earth-500/90 sm:w-auto">
                <Upload size={17} /> {t.analyzeLeftovers}
              </Button>
              <Button as={Link} to="/chat" variant="secondary" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-auto">
                <Bot size={17} /> {t.askAssistant}
              </Button>
              <Button as={Link} to="/dashboard" variant="secondary" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-auto">
                <BarChart3 size={17} /> {t.viewDashboard}
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:hidden">
              {copy.mobilePills.map((item) => (
                <div key={item} className="rounded-lg bg-white/10 px-2 py-3 text-center text-xs font-bold text-forest-50">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 max-w-xl rounded-lg border border-white/15 bg-white/10 p-3">
              <div className="flex items-center gap-3 rounded-lg bg-white px-3 py-3 text-ink">
                <Search size={18} className="text-forest-700" />
                <span className="text-sm text-ink/65">{copy.searchPlaceholder}</span>
                <ChevronRight size={18} className="ml-auto text-forest-700" />
              </div>
            </div>
          </div>
          <div className="grid content-center">
            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold text-forest-100">{copy.popularTitle}</p>
              <div className="mt-4 space-y-3">
                {copy.heroDishes.map((dish) => (
                  <HeroDish key={dish.name} name={dish.name} meta={dish.meta} score={dish.score} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-forest-900/10 bg-white shadow-soft">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[280px_1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-forest-700">{copy.sliderEyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-forest-900">{copy.sliderTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">{copy.sliderDescription}</p>
          </div>
          <div className="relative min-h-[190px]">
            {copy.sliderRecipes.map((recipe, index) => (
              <article
                key={recipe.name}
                className={[
                  "absolute inset-0 rounded-lg border border-forest-900/10 bg-earth-50 p-5 transition duration-500",
                  index === activeRecipe ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0 pointer-events-none",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-forest-700">{recipe.badge}</span>
                    <h3 className="mt-4 text-xl font-bold text-forest-900">{recipe.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{recipe.description}</p>
                  </div>
                  <span className="w-fit rounded-lg bg-forest-900 px-3 py-2 text-sm font-black text-white">{recipe.time}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 pb-5">
          {copy.sliderRecipes.map((recipe, index) => (
            <button
              key={recipe.name}
              type="button"
              onClick={() => setActiveRecipe(index)}
              className={[
                "focus-ring h-2.5 rounded-full transition",
                index === activeRecipe ? "w-8 bg-forest-700" : "w-2.5 bg-forest-900/20",
              ].join(" ")}
              aria-label={`${copy.sliderGoTo} ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {copy.metrics.map((metric) => (
          <MetricCard key={metric.label} icon={metric.icon} label={metric.label} value={metric.value} />
        ))}
      </section>

      <div className="hidden sm:block">
      <PageHeader
        title={t.simpleWayTitle}
        description={t.simpleWayDescription}
      />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-50 text-sm font-bold text-forest-700">
              {index + 1}
            </span>
            <h2 className="mt-4 text-lg font-bold text-forest-900">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">{step.text}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-4 rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft md:grid-cols-3">
        <Feature icon={Upload} title={t.photoUpload} text={copy.featurePhoto} />
        <Feature icon={Camera} title={t.liveCamera} text={copy.featureCamera} />
        <Feature icon={Bot} title={t.textAssistant} text={copy.featureText} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {copy.menuCards.map((card) => (
          <MenuCard key={card.title} title={card.title} items={card.items} />
        ))}
      </section>

      <section className="rounded-lg border border-forest-900/10 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700">
            <FileText size={22} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-forest-900">{t.pdfTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              {copy.pdfText}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const homeCopy = {
  en: {
    searchPlaceholder: "Example: leftover rice, eggs, sambal, fried chicken...",
    popularTitle: "Popular recommendations",
    heroDishes: [
      { name: "Nasi Goreng Kampung", meta: "Rice + egg + sambal", score: "92" },
      { name: "Nasi Telur Sambal", meta: "Fast breakfast idea", score: "88" },
      { name: "Perkedel Nasi", meta: "Turn rice into a side dish", score: "76" },
    ],
    metrics: [
      { icon: Utensils, label: "Indonesian menu", value: "Curated JSON" },
      { icon: ShieldCheck, label: "Safety-first", value: "Condition check" },
      { icon: Clock, label: "Fast cooking", value: "10-30 min" },
      { icon: Sparkles, label: "AI helper", value: "Text + vision" },
    ],
    mobilePills: ["Photo", "Text", "Safe recipe"],
    featurePhoto: "Pick a leftover photo from your device.",
    featureCamera: "Capture food directly on the Analyze page.",
    featureText: "Describe the leftovers when a photo is not enough.",
    menuCards: [
      { title: "Leftover rice", items: ["Village fried rice", "Rice with egg and sambal", "Rice fritters"] },
      { title: "Leftover proteins", items: ["Spicy shredded chicken", "Sauteed tofu and tempeh", "Omelet filling"] },
      { title: "Leftover vegetables", items: ["Vegetable soup", "Quick capcay", "Fried rice mix-in"] },
    ],
    pdfText: "Generated PDFs include detected foods, freshness warnings, Indonesian recipe steps, serving guidance, storage notes, mistakes to avoid, and a safety disclaimer.",
    sliderEyebrow: "Recipe ideas",
    sliderTitle: "From leftovers to ready meals",
    sliderDescription: "A rotating preview of what FoodLoop can suggest after the safety check.",
    sliderGoTo: "Go to recipe slide",
    sliderRecipes: [
      { name: "Nasi Goreng Kampung", badge: "Best for rice", time: "15 min", description: "Uses leftover rice, egg, sambal, and simple vegetables for a quick household meal." },
      { name: "Tumis Tahu Tempe", badge: "Practical protein", time: "20 min", description: "Turns tofu or tempeh leftovers into a warm side dish with Indonesian seasoning." },
      { name: "Roti Pisang Panggang", badge: "Sweet option", time: "12 min", description: "A simple snack idea for leftover bread and banana before they go to waste." },
    ],
  },
  id: {
    searchPlaceholder: "Contoh: nasi sisa, telur, sambal, ayam goreng...",
    popularTitle: "Rekomendasi populer",
    heroDishes: [
      { name: "Nasi Goreng Kampung", meta: "Nasi + telur + sambal", score: "92" },
      { name: "Nasi Telur Sambal", meta: "Cepat untuk sarapan", score: "88" },
      { name: "Perkedel Nasi", meta: "Ubah nasi jadi lauk", score: "76" },
    ],
    metrics: [
      { icon: Utensils, label: "Menu Indonesia", value: "JSON terkurasi" },
      { icon: ShieldCheck, label: "Utamakan aman", value: "Cek kondisi" },
      { icon: Clock, label: "Masak cepat", value: "10-30 menit" },
      { icon: Sparkles, label: "Asisten AI", value: "Teks + foto" },
    ],
    mobilePills: ["Foto", "Teks", "Resep aman"],
    featurePhoto: "Pilih foto leftover dari perangkat Anda.",
    featureCamera: "Ambil foto makanan langsung dari halaman Analisis.",
    featureText: "Jelaskan leftover dengan teks saat foto belum cukup jelas.",
    menuCards: [
      { title: "Nasi sisa", items: ["Nasi goreng kampung", "Nasi telur sambal", "Perkedel nasi"] },
      { title: "Lauk sisa", items: ["Ayam suwir pedas", "Tumis tahu tempe", "Isian omelet"] },
      { title: "Sayur sisa", items: ["Sayur kuah", "Capcay cepat", "Campuran nasi goreng"] },
    ],
    pdfText: "PDF yang dibuat berisi makanan terdeteksi, peringatan kesegaran, langkah resep Indonesia, panduan porsi, catatan penyimpanan, hal yang perlu dihindari, dan disclaimer keamanan.",
    sliderEyebrow: "Ide resep",
    sliderTitle: "Dari leftover jadi makanan siap saji",
    sliderDescription: "Pratinjau otomatis ide yang bisa disarankan FoodLoop setelah cek keamanan.",
    sliderGoTo: "Buka slide resep",
    sliderRecipes: [
      { name: "Nasi Goreng Kampung", badge: "Cocok untuk nasi", time: "15 menit", description: "Memakai nasi sisa, telur, sambal, dan sayur sederhana untuk menu rumah yang cepat." },
      { name: "Tumis Tahu Tempe", badge: "Protein praktis", time: "20 menit", description: "Mengubah tahu atau tempe sisa menjadi lauk hangat dengan bumbu Indonesia." },
      { name: "Roti Pisang Panggang", badge: "Opsi manis", time: "12 menit", description: "Ide camilan sederhana untuk roti dan pisang sisa sebelum terbuang." },
    ],
  },
};

function Feature({ icon: Icon, title, text }) {
  return (
    <div>
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-forest-50 text-forest-700">
        <Icon size={22} />
      </span>
      <h2 className="mt-4 text-lg font-bold text-forest-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
    </div>
  );
}

function HeroDish({ name, meta, score }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/10 p-3">
      <div>
        <p className="font-bold text-white">{name}</p>
        <p className="mt-1 text-sm text-white/60">{meta}</p>
      </div>
      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-forest-900">{score}</span>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-forest-900/10 bg-white p-4 shadow-soft">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-forest-50 text-forest-700">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm text-ink/60">{label}</p>
      <p className="mt-1 font-bold text-forest-900">{value}</p>
    </div>
  );
}

function MenuCard({ title, items }) {
  return (
    <div className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
      <h2 className="font-bold text-forest-900">{title}</h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between rounded-lg bg-earth-50 px-3 py-2 text-sm">
            <span className="font-medium text-ink/75">{item}</span>
            <ChevronRight size={16} className="text-forest-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
