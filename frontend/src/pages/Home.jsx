import { ArrowRight, Bot, Camera, CheckCircle2, Image, MessageCircle, MessageSquare, Send, ShieldCheck, Sparkles, Utensils } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ChatPreviewMockup from "../components/ChatPreviewMockup.jsx";
import CookingGuideMockup from "../components/CookingGuideMockup.jsx";
import FoodChip from "../components/FoodChip.jsx";
import PhoneMockup from "../components/PhoneMockup.jsx";
import ProgressMockup from "../components/ProgressMockup.jsx";
import RecipePreviewMockup from "../components/RecipePreviewMockup.jsx";
import SafetyCheckMockup from "../components/SafetyCheckMockup.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function Home() {
  const { language } = useApp();
  const copy = homeCopy[language] || homeCopy.id;
  const [quickInput, setQuickInput] = useState("");
  const navigate = useNavigate();
  const telegramUrl = import.meta.env.VITE_TELEGRAM_BOT_URL || "";
  const whatsappUrl = import.meta.env.VITE_WHATSAPP_BOT_URL || "";

  function submitQuickInput(event) {
    event.preventDefault();
    navigate("/start/text", { state: { initialText: quickInput.trim() } });
  }

  return (
    <div className="space-y-14 overflow-hidden pb-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-forest-900 text-white shadow-soft">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-food-yellow/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-80 w-80 rounded-full bg-mint/15 blur-3xl" />
        <div className="relative grid gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-12 lg:py-14">
          <div>
            <div className="flex flex-wrap gap-2">
              <FoodChip tone="cream">FoodLoop AI</FoodChip>
              <FoodChip tone="yellow">{copy.heroPill}</FoodChip>
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.96] tracking-normal sm:text-6xl lg:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              {copy.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/start" className="min-h-14 rounded-2xl bg-food-yellow px-6 text-base text-forest-900 hover:bg-food-yellow/90">
                {copy.primaryCta} <ArrowRight size={19} />
              </Button>
              <Button as="a" href="#cara-kerja" variant="secondary" className="min-h-14 rounded-2xl border-white/20 bg-white/10 px-6 text-base text-white hover:bg-white/15">
                {copy.secondaryCta}
              </Button>
            </div>
            <p className="mt-4 text-sm font-semibold text-white/65">{copy.trustLine}</p>
            <form onSubmit={submitQuickInput} className="mt-7 flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:flex-row">
              <input
                value={quickInput}
                onChange={(event) => setQuickInput(event.target.value)}
                className="focus-ring min-h-14 flex-1 rounded-2xl border border-white/10 bg-white px-4 text-base font-semibold text-forest-900 placeholder:text-ink/40"
                placeholder={copy.quickPlaceholder}
              />
              <Button className="min-h-14 rounded-2xl px-6" type="submit">
                {copy.quickButton}
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-6 hidden rotate-[-8deg] md:block">
              <FoodChip>nasi</FoodChip>
            </div>
            <div className="absolute right-2 top-2 hidden rotate-[9deg] md:block">
              <FoodChip tone="yellow">sambal</FoodChip>
            </div>
            <div className="absolute -bottom-2 right-10 hidden rotate-[-5deg] md:block">
              <FoodChip>telur</FoodChip>
            </div>
            <PhoneMockup>
              <ChatPreviewMockup language={language} />
            </PhoneMockup>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {copy.valueCards.map((item) => (
          <Card key={item.title} className="p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest-900">
              <item.icon size={22} />
            </span>
            <h2 className="mt-4 text-xl font-black text-forest-900">{item.title}</h2>
            <p className="mt-2 text-base leading-7 text-ink/70">{item.text}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-5" id="cara-kerja">
        <SectionHeader eyebrow={copy.transformEyebrow} title={copy.transformTitle} text={copy.transformText} />
        <div className="grid gap-4 lg:grid-cols-3">
          {copy.transforms.map((item) => (
            <Card key={item.before} className="p-5">
              <p className="rounded-2xl bg-earth-50 p-4 text-base font-black text-forest-900">{item.before}</p>
              <div className="my-4 flex items-center gap-3 text-sm font-black text-forest-700">
                <span className="h-px flex-1 bg-forest-900/10" />
                {copy.checksSafety}
                <span className="h-px flex-1 bg-forest-900/10" />
              </div>
              <p className="rounded-2xl bg-mint p-4 text-base font-black text-forest-900">{item.after}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow={copy.stepsEyebrow} title={copy.stepsTitle} text={copy.stepsText} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.steps.map((step, index) => (
            <Card key={step.title} className="p-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-xl font-black text-white">{index + 1}</span>
              <h3 className="mt-5 text-xl font-black text-forest-900">{step.title}</h3>
              <p className="mt-2 text-base leading-7 text-ink/70">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <ProductSection
        eyebrow={copy.previewA.eyebrow}
        title={copy.previewA.title}
        text={copy.previewA.text}
        mockup={<PhoneMockup><div className="space-y-3"><MockInput icon={Camera} text={copy.photoMockup} /><MockInput icon={Image} text={copy.galleryMockup} /><MockInput icon={MessageSquare} text={copy.textMockup} /></div></PhoneMockup>}
      />

      <ProductSection
        flip
        eyebrow={copy.previewB.eyebrow}
        title={copy.previewB.title}
        text={copy.previewB.text}
        mockup={<SafetyCheckMockup language={language} />}
      />

      <ProductSection
        eyebrow={copy.previewC.eyebrow}
        title={copy.previewC.title}
        text={copy.previewC.text}
        mockup={<RecipePreviewMockup language={language} />}
      />

      <ProductSection
        flip
        eyebrow={copy.previewD.eyebrow}
        title={copy.previewD.title}
        text={copy.previewD.text}
        mockup={<CookingGuideMockup language={language} />}
      />

      <section className="space-y-5">
        <SectionHeader eyebrow={copy.chatEyebrow} title={copy.chatTitle} text={copy.chatText} />
        <div className="grid gap-4 md:grid-cols-2">
          <ChatAccessCard
            icon={Send}
            title={copy.telegramTitle}
            text={copy.telegramText}
            button={copy.telegramButton}
            href={telegramUrl}
            unavailable={copy.comingSoon}
          />
          <ChatAccessCard
            icon={MessageCircle}
            title={copy.whatsappTitle}
            text={copy.whatsappText}
            button={copy.whatsappButton}
            href={whatsappUrl}
            unavailable={copy.comingSoon}
          />
        </div>
      </section>

      <ProductSection
        eyebrow={copy.previewE.eyebrow}
        title={copy.previewE.title}
        text={copy.previewE.text}
        mockup={<ProgressMockup language={language} />}
      />

      <section className="space-y-5">
        <SectionHeader eyebrow={copy.useCaseEyebrow} title={copy.useCaseTitle} text={copy.useCaseText} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.useCases.map((item) => (
            <Card key={item.title} className="p-5">
              <h3 className="text-xl font-black text-forest-900">{item.title}</h3>
              <p className="mt-2 text-base leading-7 text-ink/70">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-forest-900 p-6 text-center text-white shadow-soft sm:p-10">
        <Sparkles className="mx-auto text-food-yellow" size={34} />
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black leading-tight">{copy.finalTitle}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/75">{copy.finalText}</p>
        <Button as={Link} to="/start" className="mt-7 min-h-14 rounded-2xl bg-food-yellow px-7 text-base text-forest-900 hover:bg-food-yellow/90">
          {copy.primaryCta} <ArrowRight size={19} />
        </Button>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-forest-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-forest-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-lg leading-8 text-ink/68">{text}</p>
    </div>
  );
}

function ProductSection({ eyebrow, title, text, mockup, flip = false }) {
  return (
    <section className={`grid gap-7 rounded-[2rem] bg-white/55 p-5 sm:p-8 lg:grid-cols-2 lg:items-center ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-forest-700">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black leading-tight text-forest-900 sm:text-4xl">{title}</h2>
        <p className="mt-4 text-lg leading-8 text-ink/70">{text}</p>
      </div>
      <div>{mockup}</div>
    </section>
  );
}

function MockInput({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest-900">
        <Icon size={21} />
      </span>
      <p className="text-base font-black text-forest-900">{text}</p>
    </div>
  );
}

function ChatAccessCard({ icon: Icon, title, text, button, href, unavailable }) {
  const enabled = Boolean(href);
  return (
    <Card className="flex h-full flex-col p-5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-white">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 text-2xl font-black text-forest-900">{title}</h3>
      <p className="mt-2 flex-1 text-base leading-7 text-ink/70">{text}</p>
      {enabled ? (
        <Button as="a" href={href} target="_blank" rel="noreferrer" className="mt-5 min-h-14 rounded-2xl text-base">
          <Bot size={18} /> {button}
        </Button>
      ) : (
        <button type="button" disabled className="mt-5 min-h-14 rounded-2xl bg-earth-100 px-5 text-base font-black text-ink/45">
          {unavailable}
        </button>
      )}
    </Card>
  );
}

const sharedIcons = [Camera, ShieldCheck, Utensils];

const homeCopy = {
  id: {
    heroPill: "Asisten dapur Indonesia",
    heroTitle: "Sisa makanan jadi resep aman. Dalam beberapa langkah.",
    heroSubtitle: "Foto atau tulis makanan yang Anda punya. FoodLoop membantu cek keamanan, memberi ide resep Indonesia, dan memandu langkah memasak.",
    primaryCta: "Mulai Sekarang",
    secondaryCta: "Lihat Cara Kerja",
    trustLine: "Cocok untuk rumah tangga, anak kos, warung kecil, dan orang tua.",
    quickPlaceholder: "Contoh: nasi sisa, telur, sambal...",
    quickButton: "Cari ide",
    valueCards: [
      { icon: sharedIcons[0], title: "Foto atau tulis bebas", text: "Tidak perlu format rumit. Ambil foto atau ketik bahan dengan bahasa sehari-hari." },
      { icon: sharedIcons[1], title: "Utamakan keamanan", text: "FoodLoop mengingatkan soal bau, lendir, jamur, suhu ruang, dan penyimpanan." },
      { icon: sharedIcons[2], title: "Resep Indonesia", text: "Saran dibuat untuk makanan familiar seperti nasi goreng, omelet, perkedel, dan tumisan." },
    ],
    transformEyebrow: "Sebelum dan sesudah",
    transformTitle: "Dari sisa makanan jadi menu siap saji",
    transformText: "FoodLoop mengubah bahan yang hampir terlupakan menjadi ide masakan yang jelas dan aman.",
    checksSafety: "cek aman",
    transforms: [
      { before: "Nasi sisa + telur + sambal", after: "Nasi Goreng Kampung - 15 menit" },
      { before: "Pisang matang + roti", after: "Roti Pisang Panggang - 10 menit" },
      { before: "Sayur sisa + telur", after: "Omelet Sayur - 12 menit" },
    ],
    stepsEyebrow: "Alur sederhana",
    stepsTitle: "Buka, masukkan makanan, lalu ikuti arahan",
    stepsText: "Pengalaman dibuat untuk pengguna yang tidak ingin memikirkan istilah teknis.",
    steps: [
      { title: "Foto atau tulis", text: "Masukkan makanan dengan kamera, galeri, atau teks." },
      { title: "Cek keamanan", text: "Jawab pertanyaan singkat soal waktu, penyimpanan, dan tanda basi." },
      { title: "Pilih resep", text: "Lihat ide masakan Indonesia yang cocok dengan bahan Anda." },
      { title: "Masak bertahap", text: "Ikuti langkah besar satu per satu sampai selesai." },
    ],
    previewA: { eyebrow: "Input mudah", title: "FoodLoop membaca makanan Anda", text: "Ambil foto atau tulis bahan secara bebas. FoodLoop membantu mengenali bahan yang terlihat dan menyiapkan analisis." },
    previewB: { eyebrow: "Safety first", title: "Cek keamanan sebelum memasak", text: "Sebelum menyarankan resep, FoodLoop meminta konfirmasi kondisi penting agar pengguna tidak asal mengolah makanan berisiko." },
    previewC: { eyebrow: "Resep familiar", title: "Resep Indonesia yang masuk akal", text: "Kartu resep menonjolkan waktu, kesulitan, bahan yang dipakai, dan alasan singkat tanpa skor teknis." },
    previewD: { eyebrow: "Saat memasak", title: "Masak langkah demi langkah", text: "Instruksi besar dan tombol jelas membantu pengguna mengikuti resep sambil berdiri di dapur." },
    chatEyebrow: "Akses lewat chat",
    chatTitle: "Pakai FoodLoop lewat WhatsApp atau Telegram",
    chatText: "Tidak perlu membuka website setiap kali. Kirim foto atau tulis sisa makanan langsung dari chat. FoodLoop akan membantu cek keamanan dan memberi ide resep Indonesia.",
    telegramTitle: "Telegram Bot",
    telegramText: "Cocok untuk demo dan testing. Kirim foto atau teks langsung ke FoodLoop.",
    telegramButton: "Chat via Telegram",
    whatsappTitle: "WhatsApp Bot",
    whatsappText: "Cocok untuk pengguna harian. Kirim pesan ke nomor FoodLoop.",
    whatsappButton: "Chat via WhatsApp",
    comingSoon: "Segera hadir",
    previewE: { eyebrow: "Tersimpan", title: "Riwayat dan ringkasan", text: "FoodLoop menyimpan analisis, resep yang dimulai, selesai, atau berhenti agar progres dapat dilihat lagi." },
    photoMockup: "Foto makanan",
    galleryMockup: "Pilih dari galeri",
    textMockup: "Tulis sendiri",
    useCaseEyebrow: "Untuk dapur Indonesia",
    useCaseTitle: "Dibuat untuk kebutuhan sehari-hari",
    useCaseText: "Bukan dashboard teknis. FoodLoop terasa seperti teman dapur yang praktis.",
    useCases: [
      { title: "Rumah tangga", text: "Bantu memakai nasi, lauk, dan sayur sisa dengan lebih aman." },
      { title: "Anak kos", text: "Cari menu cepat dari bahan terbatas tanpa bingung." },
      { title: "Warung kecil", text: "Pantau ide pemanfaatan bahan agar tidak cepat terbuang." },
      { title: "Orang tua", text: "Instruksi besar, bahasa sederhana, dan keputusan keamanan jelas." },
    ],
    finalTitle: "Punya sisa makanan sekarang?",
    finalText: "Coba tulis atau foto makanan Anda. FoodLoop bantu cari ide yang aman dan mudah dimasak.",
  },
  en: {
    heroPill: "Indonesian kitchen assistant",
    heroTitle: "Leftovers become safer meals. In a few steps.",
    heroSubtitle: "Take a photo or write what food you have. FoodLoop helps check safety, suggest Indonesian recipes, and guide cooking steps.",
    primaryCta: "Start Now",
    secondaryCta: "See How It Works",
    trustLine: "Useful for households, students, small stalls, and older users.",
    quickPlaceholder: "Example: leftover rice, egg, sambal...",
    quickButton: "Find ideas",
    valueCards: [
      { icon: sharedIcons[0], title: "Photo or simple text", text: "No complicated format. Use a photo or everyday language." },
      { icon: sharedIcons[1], title: "Safety first", text: "FoodLoop reminds users about smell, slime, mold, room temperature, and storage." },
      { icon: sharedIcons[2], title: "Indonesian recipes", text: "Suggestions focus on familiar meals like fried rice, omelets, fritters, and stir-fries." },
    ],
    transformEyebrow: "Before and after",
    transformTitle: "From leftovers to ready meals",
    transformText: "FoodLoop turns nearly forgotten ingredients into clear, safer cooking ideas.",
    checksSafety: "safety check",
    transforms: [
      { before: "Leftover rice + egg + sambal", after: "Nasi Goreng Kampung - 15 min" },
      { before: "Ripe banana + bread", after: "Banana Toast - 10 min" },
      { before: "Vegetables + egg", after: "Vegetable Omelet - 12 min" },
    ],
    stepsEyebrow: "Simple flow",
    stepsTitle: "Open, enter food, then follow guidance",
    stepsText: "The experience avoids technical words and keeps one clear next action.",
    steps: [
      { title: "Photo or write", text: "Use camera, gallery, or text." },
      { title: "Check safety", text: "Answer short questions about time, storage, and spoilage signs." },
      { title: "Pick recipe", text: "See Indonesian meal ideas that fit your ingredients." },
      { title: "Cook step by step", text: "Follow large instructions one at a time." },
    ],
    previewA: { eyebrow: "Easy input", title: "FoodLoop reads your food", text: "Take a photo or write freely. FoodLoop helps identify visible ingredients and prepare analysis." },
    previewB: { eyebrow: "Safety first", title: "Check safety before cooking", text: "FoodLoop asks for important condition checks before suggesting a recipe." },
    previewC: { eyebrow: "Familiar recipes", title: "Indonesian recipes that make sense", text: "Recipe cards show time, difficulty, ingredients used, and a short reason without technical scores." },
    previewD: { eyebrow: "While cooking", title: "Cook step by step", text: "Large instructions and clear buttons help users follow the recipe in the kitchen." },
    chatEyebrow: "Chat access",
    chatTitle: "Use FoodLoop through WhatsApp or Telegram",
    chatText: "You do not need to open the website every time. Send a photo or write leftovers directly from chat, and FoodLoop will help check safety and suggest Indonesian recipes.",
    telegramTitle: "Telegram Bot",
    telegramText: "Best for demos and testing. Send a photo or text directly to FoodLoop.",
    telegramButton: "Chat via Telegram",
    whatsappTitle: "WhatsApp Bot",
    whatsappText: "Best for daily use. Send a message to the FoodLoop number.",
    whatsappButton: "Chat via WhatsApp",
    comingSoon: "Coming soon",
    previewE: { eyebrow: "Saved progress", title: "History and summary", text: "FoodLoop saves analyses and cooking sessions so progress can be revisited." },
    photoMockup: "Take a photo",
    galleryMockup: "Choose from gallery",
    textMockup: "Write it yourself",
    useCaseEyebrow: "For Indonesian kitchens",
    useCaseTitle: "Built for everyday use",
    useCaseText: "Not a technical dashboard. FoodLoop feels like a practical kitchen companion.",
    useCases: [
      { title: "Households", text: "Reuse leftover rice, dishes, and vegetables more safely." },
      { title: "Students", text: "Find quick meals from limited ingredients." },
      { title: "Small stalls", text: "Track ideas for ingredients before they go to waste." },
      { title: "Older users", text: "Large instructions, simple language, and clear safety decisions." },
    ],
    finalTitle: "Have leftovers right now?",
    finalText: "Try writing or photographing your food. FoodLoop will help find safer, easy cooking ideas.",
  },
};
