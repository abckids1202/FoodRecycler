import { Bot, Camera, CheckCircle2, RefreshCcw, ScanSearch, Upload as UploadIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import ErrorState from "../components/ErrorState.jsx";
import ImagePreview from "../components/ImagePreview.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import UploadBox from "../components/UploadBox.jsx";
import { uploadWasteImage } from "../api/wasteApi";
import { useApp } from "../context/AppContext.jsx";
import { dataUrlToFile, fileToPreviewUrl } from "../utils/fileHelpers";

export default function Upload() {
  const { t, user, language } = useApp();
  const copy = uploadCopy[language] || uploadCopy.en;
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [inputMode, setInputMode] = useState("photo");
  const [file, setFile] = useState(null);
  const [captureUrl, setCaptureUrl] = useState(null);
  const [stream, setStream] = useState(null);
  const [assistantText, setAssistantText] = useState("");
  const [clarification, setClarification] = useState("");
  const [condition, setCondition] = useState("normal");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const previewUrl = useMemo(() => fileToPreviewUrl(file), [file]);
  const selectedImageUrl = captureUrl || previewUrl;

  useEffect(() => {
    if (inputMode !== "camera") {
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
  }, [inputMode]);

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

  async function handleAnalyze() {
    const imageFile = captureUrl ? dataUrlToFile(captureUrl) : file;
    if (!imageFile) return;
    setStatus("loading");
    setError(null);

    try {
      const uploadResult = await uploadWasteImage({ file: imageFile, userId: user?.id, condition, clarification });
      const batchId = uploadResult.batch_id || uploadResult.id;
      navigate(`/analysis/${batchId}`);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
      setStatus("error");
    }
  }

  function handleAssistantSubmit() {
    const trimmed = assistantText.trim();
    if (!trimmed) return;
    navigate("/chat", { state: { initialPrompt: trimmed } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.navAnalyze}
        title={t.analyzeTitle}
        description={t.analyzeDescription}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {copy.flow.map((item, index) => (
          <FlowCard key={item.title} number={`0${index + 1}`} title={item.title} text={item.text} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid gap-3 rounded-lg border border-forest-900/10 bg-white p-3 shadow-soft sm:grid-cols-3">
            <ModeButton active={inputMode === "photo"} onClick={() => setInputMode("photo")} icon={UploadIcon} label={t.uploadPhoto} />
            <ModeButton active={inputMode === "camera"} onClick={() => setInputMode("camera")} icon={Camera} label={t.liveCamera} />
            <ModeButton active={inputMode === "text"} onClick={() => setInputMode("text")} icon={Bot} label={t.textAssistant} />
          </div>

          {inputMode === "photo" && (
            <UploadBox
              selectedFile={file}
              onFileSelected={(selectedFile) => {
                setFile(selectedFile);
                setCaptureUrl(null);
              }}
            />
          )}

          {inputMode === "camera" && (
            <section className="space-y-4 rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
              <div className="overflow-hidden rounded-lg bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={captureFrame} disabled={!stream}>
                  <Camera size={18} />
                  {t.capturePhoto}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setCaptureUrl(null)} disabled={!captureUrl}>
                  <RefreshCcw size={18} />
                  {t.retake}
                </Button>
              </div>
            </section>
          )}

          {inputMode === "text" && (
            <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
              <div className="mb-4 grid gap-2 sm:grid-cols-3">
                {copy.textChips.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-lg bg-earth-50 px-3 py-2 text-xs font-semibold text-forest-900">
                    <CheckCircle2 size={14} />
                    {item}
                  </span>
                ))}
              </div>
              <label className="text-sm font-semibold text-forest-900">
                {t.describeLeftovers}
                <textarea
                  value={assistantText}
                  onChange={(event) => setAssistantText(event.target.value)}
                  className="focus-ring mt-2 min-h-36 w-full resize-y rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-3 text-sm"
                  placeholder={t.describePlaceholder}
                />
              </label>
              <Button type="button" className="mt-4" onClick={handleAssistantSubmit} disabled={!assistantText.trim()}>
                <Bot size={18} />
                {t.askAssistant}
              </Button>
            </section>
          )}

          {inputMode !== "text" && <ConditionSelect value={condition} onChange={setCondition} t={t} />}

          {inputMode !== "text" && (
            <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
              <label className="text-sm font-semibold text-forest-900">
                {copy.clarifyLabel}
                <textarea
                  value={clarification}
                  onChange={(event) => setClarification(event.target.value)}
                  className="focus-ring mt-2 min-h-24 w-full resize-y rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-3 text-sm"
                  placeholder={copy.clarifyPlaceholder}
                />
              </label>
            </section>
          )}

          {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
          {error && <ErrorState message={error} />}

          {inputMode !== "text" && (
            <Button type="button" onClick={handleAnalyze} disabled={(!file && !captureUrl) || status === "loading"}>
              <ScanSearch size={18} />
              {t.analyzeButton}
            </Button>
          )}
        </div>

        <ImagePreview src={selectedImageUrl} />
      </div>
    </div>
  );
}

const uploadCopy = {
  en: {
    flow: [
      { title: "Enter food details", text: "Choose a photo, camera, or written leftover description." },
      { title: "Check safety", text: "Food condition helps FoodLoop choose safety-first suggestions." },
      { title: "Get menu ideas", text: "OpenAI matches the input with Indonesian food data." },
    ],
    textChips: ["Food type", "When it was cooked", "Allergy/servings/time"],
    clarifyLabel: "Clarify visible leftovers",
    clarifyPlaceholder: "Optional: white rice, fried chicken, sambal, stir-fried vegetables. Stored in the fridge since last night, 2 portions.",
    loadingTitle: "Analyzing image",
    loadingMessage: "Uploading, storing, and running food detection.",
    cameraDenied: "Camera permission was denied.",
  },
  id: {
    flow: [
      { title: "Masukkan data", text: "Pilih foto, kamera, atau tulis detail leftover." },
      { title: "Cek keamanan", text: "Kondisi makanan dipakai untuk saran yang mengutamakan keamanan." },
      { title: "Dapat ide menu", text: "OpenAI mencocokkan input dengan data makanan Indonesia." },
    ],
    textChips: ["Jenis makanan", "Kapan dimasak", "Alergi/porsi/waktu"],
    clarifyLabel: "Perjelas leftover yang terlihat",
    clarifyPlaceholder: "Opsional: nasi putih, ayam goreng, sambal, sayur tumis. Disimpan di kulkas sejak tadi malam, 2 porsi.",
    loadingTitle: "Menganalisis gambar",
    loadingMessage: "Mengunggah, menyimpan, dan menjalankan deteksi makanan.",
    cameraDenied: "Izin kamera ditolak.",
  },
};

function ModeButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "focus-ring flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
        active ? "bg-forest-900 text-white" : "bg-earth-50 text-ink/70 hover:bg-forest-50 hover:text-forest-900",
      ].join(" ")}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function ConditionSelect({ value, onChange, t }) {
  return (
    <label className="block rounded-lg border border-forest-900/10 bg-white p-5 text-sm font-semibold text-forest-900 shadow-soft">
      {t.leftoverCondition}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 w-full rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-2"
      >
        <option value="fresh">{t.conditionFresh}</option>
        <option value="normal">{t.conditionNormal}</option>
        <option value="refrigerated">{t.conditionRefrigerated}</option>
        <option value="unknown">{t.conditionUnknown}</option>
        <option value="spoiled">{t.conditionSpoiled}</option>
        <option value="contaminated">{t.conditionContaminated}</option>
      </select>
    </label>
  );
}

function FlowCard({ number, title, text }) {
  return (
    <div className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
      <span className="text-sm font-black text-forest-700">{number}</span>
      <h2 className="mt-2 font-bold text-forest-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-ink/65">{text}</p>
    </div>
  );
}
