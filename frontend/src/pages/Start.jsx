import { Camera, CheckCircle2, Image, MessageSquare, RefreshCcw, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ErrorState from "../components/ErrorState.jsx";
import FoodChip from "../components/FoodChip.jsx";
import ImagePreview from "../components/ImagePreview.jsx";
import LoadingState from "../components/LoadingState.jsx";
import SafetyNotice from "../components/SafetyNotice.jsx";
import StepIndicator from "../components/StepIndicator.jsx";
import UploadBox from "../components/UploadBox.jsx";
import { analyzeWasteText, uploadWasteImage } from "../api/wasteApi";
import { useApp } from "../context/AppContext.jsx";
import { dataUrlToFile, fileToPreviewUrl } from "../utils/fileHelpers";

export default function Start() {
  const { user, language } = useApp();
  const copy = startCopy[language] || startCopy.id;
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [method, setMethod] = useState(location.state?.initialText ? "text" : "");
  const [foodText, setFoodText] = useState(location.state?.initialText || "");
  const [file, setFile] = useState(null);
  const [captureUrl, setCaptureUrl] = useState(null);
  const [stream, setStream] = useState(null);
  const [cookedAt, setCookedAt] = useState("");
  const [storage, setStorage] = useState("");
  const [spoilage, setSpoilage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => fileToPreviewUrl(file), [file]);
  const selectedImageUrl = captureUrl || previewUrl;
  const currentStep = method ? 1 : 0;

  useEffect(() => {
    if (method !== "camera") {
      stream?.getTracks().forEach((track) => track.stop());
      setStream(null);
      return;
    }

    let activeStream;
    async function startCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(activeStream);
        if (videoRef.current) videoRef.current.srcObject = activeStream;
      } catch (cameraError) {
        setError(cameraError.message || copy.cameraDenied);
      }
    }

    startCamera();
    return () => activeStream?.getTracks().forEach((track) => track.stop());
  }, [method]);

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setCaptureUrl(canvas.toDataURL("image/jpeg", 0.92));
    setFile(null);
  }

  function conditionFromSafety() {
    if (spoilage && spoilage !== "none") return "spoiled";
    if (storage === "fridge") return "refrigerated";
    if (storage === "room" || cookedAt === "over4") return "unknown";
    return "normal";
  }

  function buildTextPrompt() {
    return [
      foodText,
      cookedAt ? `${copy.promptCooked}: ${copy.optionLabels[cookedAt]}` : "",
      storage ? `${copy.promptStorage}: ${copy.optionLabels[storage]}` : "",
      spoilage ? `${copy.promptSpoilage}: ${copy.optionLabels[spoilage]}` : "",
    ].filter(Boolean).join("\n");
  }

  async function handleSubmit() {
    setStatus("loading");
    setError("");
    try {
      let result;
      const condition = conditionFromSafety();
      if (method === "text") {
        result = await analyzeWasteText({ text: buildTextPrompt(), userId: user?.id, condition });
      } else {
        const imageFile = captureUrl ? dataUrlToFile(captureUrl) : file;
        if (!imageFile) {
          setError(copy.needInput);
          setStatus("idle");
          return;
        }
        result = await uploadWasteImage({ file: imageFile, userId: user?.id, condition, clarification: buildTextPrompt() });
      }
      navigate(`/analysis/${result.batch_id || result.id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
      setStatus("error");
    }
  }

  const canSubmit = method === "text" ? foodText.trim() : file || captureUrl;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-forest-900 p-5 text-white shadow-soft sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <FoodChip tone="yellow">{copy.badge}</FoodChip>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{copy.subtitle}</p>
          </div>
          <StepIndicator steps={copy.steps} current={currentStep} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-2xl font-black text-forest-900">{copy.chooseTitle}</h2>
            <p className="mt-2 text-base leading-7 text-ink/65">{copy.chooseText}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {copy.methods.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMethod(item.value)}
                  className={`focus-ring min-h-32 rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 ${method === item.value ? "border-forest-900 bg-mint shadow-soft" : "border-forest-900/10 bg-earth-50 hover:bg-white"}`}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-white">
                    <item.icon size={22} />
                  </span>
                  <span className="mt-4 block text-lg font-black text-forest-900">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-ink/65">{item.text}</span>
                </button>
              ))}
            </div>
          </Card>

          {method && (
            <Card className="p-5">
              <h2 className="text-2xl font-black text-forest-900">{copy.inputTitle}</h2>
              <p className="mt-2 text-base leading-7 text-ink/65">{copy.inputText}</p>

              {method === "gallery" && (
                <div className="mt-5">
                  <UploadBox selectedFile={file} onFileSelected={(selectedFile) => { setFile(selectedFile); setCaptureUrl(null); }} />
                </div>
              )}

              {method === "camera" && (
                <div className="mt-5 space-y-4">
                  <div className="overflow-hidden rounded-3xl bg-black">
                    <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={captureFrame} disabled={!stream}>
                      <Camera size={18} /> {copy.capture}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setCaptureUrl(null)} disabled={!captureUrl}>
                      <RefreshCcw size={18} /> {copy.retake}
                    </Button>
                  </div>
                </div>
              )}

              {method === "text" && (
                <div className="mt-5">
                  <textarea
                    value={foodText}
                    onChange={(event) => setFoodText(event.target.value)}
                    className="focus-ring min-h-44 w-full resize-y rounded-3xl border border-forest-900/10 bg-earth-50 px-5 py-4 text-lg font-semibold leading-8 text-ink placeholder:text-ink/35"
                    placeholder={copy.textPlaceholder}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {copy.chips.map((chip) => (
                      <button key={chip} type="button" onClick={() => setFoodText((current) => `${current}${current ? ", " : ""}${chip}`)} className="rounded-full bg-mint px-3 py-2 text-sm font-black text-forest-900">
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {method && (
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-food-yellow text-forest-900">
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-forest-900">{copy.safetyTitle}</h2>
                  <p className="mt-1 text-base leading-7 text-ink/65">{copy.safetyText}</p>
                </div>
              </div>
              <SafetyQuestion title={copy.cookedQuestion} value={cookedAt} onChange={setCookedAt} options={copy.cookedOptions} />
              <SafetyQuestion title={copy.storageQuestion} value={storage} onChange={setStorage} options={copy.storageOptions} />
              <SafetyQuestion title={copy.spoilageQuestion} value={spoilage} onChange={setSpoilage} options={copy.spoilageOptions} />
              <SafetyNotice title={copy.safetyNoteTitle}>{copy.safetyNote}</SafetyNotice>
            </Card>
          )}

          {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
          {error && <ErrorState title={copy.errorTitle} message={error} />}

          {method && (
            <div className="rounded-3xl bg-white p-3 shadow-soft">
              <Button type="button" className="min-h-14 w-full rounded-2xl text-base" onClick={handleSubmit} disabled={!canSubmit || status === "loading"}>
                <Search size={19} /> {copy.submit}
              </Button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <ImagePreview src={selectedImageUrl} />
          <Card className="p-5">
            <h2 className="text-xl font-black text-forest-900">{copy.sideTitle}</h2>
            <div className="mt-4 space-y-3">
              {copy.sideItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-earth-50 p-3 text-sm font-bold text-forest-900">
                  <CheckCircle2 size={18} className="text-forest-700" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SafetyQuestion({ title, options, value, onChange }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-black text-forest-900">{title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`focus-ring min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${value === option.value ? "border-forest-900 bg-mint text-forest-900" : "border-forest-900/10 bg-white text-ink/70 hover:bg-earth-50"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const startCopy = {
  id: {
    badge: "Mulai dari sini",
    title: "Makanan apa yang ingin Anda olah?",
    subtitle: "Pilih salah satu cara. FoodLoop akan bantu cek keamanan dan cari resep Indonesia.",
    steps: ["Masukkan", "Cek aman", "Konfirmasi", "Resep"],
    chooseTitle: "Pilih cara input",
    chooseText: "Gunakan cara yang paling mudah untuk Anda.",
    methods: [
      { value: "camera", title: "Foto makanan", text: "Ambil foto langsung dari kamera", icon: Camera },
      { value: "gallery", title: "Pilih dari galeri", text: "Unggah foto dari HP atau laptop", icon: Image },
      { value: "text", title: "Tulis sendiri", text: "Ketik sisa makanan yang ada", icon: MessageSquare },
    ],
    inputTitle: "Masukkan makanan",
    inputText: "Cukup tulis atau foto bahan yang ada. Detail kecil seperti sambal atau saus juga membantu.",
    textPlaceholder: "Contoh: nasi sisa, telur, sambal, ayam goreng. Disimpan di kulkas sejak semalam.",
    chips: ["nasi sisa", "telur", "sambal", "sayur", "ayam", "tahu", "tempe", "pisang"],
    capture: "Ambil Foto",
    retake: "Ulangi",
    cameraDenied: "Izin kamera ditolak.",
    safetyTitle: "Cek keamanan singkat",
    safetyText: "Jawab sebentar. Kalau ragu, FoodLoop akan mengutamakan keamanan.",
    cookedQuestion: "Kapan makanan ini dimasak atau dibeli?",
    storageQuestion: "Disimpan di mana?",
    spoilageQuestion: "Ada tanda basi?",
    cookedOptions: [
      { value: "today", label: "Hari ini" },
      { value: "yesterday", label: "Kemarin" },
      { value: "two3", label: "2-3 hari lalu" },
      { value: "over4", label: "Lebih dari 4 hari" },
      { value: "unknown", label: "Tidak tahu" },
    ],
    storageOptions: [
      { value: "fridge", label: "Kulkas" },
      { value: "freezer", label: "Freezer" },
      { value: "room", label: "Suhu ruang" },
      { value: "unknown", label: "Tidak tahu" },
    ],
    spoilageOptions: [
      { value: "none", label: "Tidak ada" },
      { value: "smell", label: "Bau asam/busuk" },
      { value: "slimy", label: "Berlendir" },
      { value: "mold", label: "Berjamur" },
      { value: "color", label: "Warna berubah" },
      { value: "unsure", label: "Tidak yakin" },
    ],
    optionLabels: {
      today: "hari ini", yesterday: "kemarin", two3: "2-3 hari lalu", over4: "lebih dari 4 hari", unknown: "tidak tahu",
      fridge: "kulkas", freezer: "freezer", room: "suhu ruang", none: "tidak ada", smell: "bau asam/busuk", slimy: "berlendir", mold: "berjamur", color: "warna berubah", unsure: "tidak yakin",
    },
    promptCooked: "Kapan dimasak/dibeli",
    promptStorage: "Penyimpanan",
    promptSpoilage: "Tanda basi",
    safetyNoteTitle: "PENTING",
    safetyNote: "Jika ada bau busuk, lendir, jamur, atau terlalu lama di suhu ruang, lebih aman jangan dimakan.",
    loadingTitle: "Sedang membaca makanan...",
    loadingMessage: "FoodLoop sedang cek keamanan dan menyiapkan ide resep.",
    errorTitle: "Koneksi ke server gagal",
    needInput: "Masukkan foto atau teks terlebih dahulu.",
    submit: "Lihat Ide Resep",
    sideTitle: "Setelah ini",
    sideItems: ["Cek bahan yang terlihat", "Tambahkan bahan yang terlewat", "Pilih resep yang cocok", "Ikuti langkah memasak"],
  },
  en: {
    badge: "Start here",
    title: "What food do you want to reuse?",
    subtitle: "Choose one method. FoodLoop will help check safety and find Indonesian recipes.",
    steps: ["Input", "Safety", "Confirm", "Recipe"],
    chooseTitle: "Choose input method",
    chooseText: "Use the easiest method for you.",
    methods: [
      { value: "camera", title: "Take a photo", text: "Use the camera directly", icon: Camera },
      { value: "gallery", title: "Choose from gallery", text: "Upload a photo from your device", icon: Image },
      { value: "text", title: "Write it yourself", text: "Type the leftovers you have", icon: MessageSquare },
    ],
    inputTitle: "Enter food",
    inputText: "Write or photograph what you have. Small details like sauces help.",
    textPlaceholder: "Example: leftover rice, egg, sambal, fried chicken. Stored in the fridge since last night.",
    chips: ["leftover rice", "egg", "sambal", "vegetables", "chicken", "tofu", "tempeh", "banana"],
    capture: "Capture Photo",
    retake: "Retake",
    cameraDenied: "Camera permission was denied.",
    safetyTitle: "Quick safety check",
    safetyText: "Answer briefly. When unsure, FoodLoop prioritizes safety.",
    cookedQuestion: "When was this cooked or bought?",
    storageQuestion: "Where was it stored?",
    spoilageQuestion: "Any spoilage signs?",
    cookedOptions: [
      { value: "today", label: "Today" }, { value: "yesterday", label: "Yesterday" }, { value: "two3", label: "2-3 days ago" }, { value: "over4", label: "More than 4 days" }, { value: "unknown", label: "Not sure" },
    ],
    storageOptions: [
      { value: "fridge", label: "Fridge" }, { value: "freezer", label: "Freezer" }, { value: "room", label: "Room temp" }, { value: "unknown", label: "Not sure" },
    ],
    spoilageOptions: [
      { value: "none", label: "None" }, { value: "smell", label: "Sour/rotten smell" }, { value: "slimy", label: "Slimy" }, { value: "mold", label: "Moldy" }, { value: "color", label: "Color changed" }, { value: "unsure", label: "Not sure" },
    ],
    optionLabels: {
      today: "today", yesterday: "yesterday", two3: "2-3 days ago", over4: "more than 4 days", unknown: "not sure",
      fridge: "fridge", freezer: "freezer", room: "room temperature", none: "none", smell: "sour/rotten smell", slimy: "slimy", mold: "moldy", color: "color changed", unsure: "not sure",
    },
    promptCooked: "Cooked/bought",
    promptStorage: "Storage",
    promptSpoilage: "Spoilage signs",
    safetyNoteTitle: "IMPORTANT",
    safetyNote: "If it smells rotten, is slimy, moldy, or stayed too long at room temperature, it is safer not to eat.",
    loadingTitle: "Reading your food...",
    loadingMessage: "FoodLoop is checking safety and preparing recipe ideas.",
    errorTitle: "Could not reach server",
    needInput: "Add a photo or text first.",
    submit: "See Recipe Ideas",
    sideTitle: "Next",
    sideItems: ["Check visible ingredients", "Add missing ingredients", "Choose a matching recipe", "Follow cooking steps"],
  },
};
