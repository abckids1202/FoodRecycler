import { Leaf, Lock, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import LanguageSelect from "../components/LanguageSelect.jsx";
import { demoAuth } from "../api/authApi";
import { getApiBaseUrl } from "../api/client";
import { useApp } from "../context/AppContext.jsx";

export default function Auth() {
  const navigate = useNavigate();
  const { login, t, language } = useApp();
  const copy = authCopy[language] || authCopy.en;
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    age: "",
    reason: "",
  });
  const [pendingOAuthProfile, setPendingOAuthProfile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthId = params.get("oauth_id");
    const oauthEmail = params.get("oauth_email");
    if (!oauthId || !oauthEmail) return;

    const oauthProfile = {
      id: Number(oauthId),
      name: params.get("oauth_name") || oauthEmail.split("@")[0],
      email: oauthEmail,
      provider: params.get("oauth_provider") || "google",
      phone: params.get("oauth_phone") || "",
      age: params.get("oauth_age") || "",
      reason: params.get("oauth_reason") || "",
    };

    if (oauthProfile.phone && oauthProfile.age && oauthProfile.reason) {
      login(oauthProfile);
      navigate("/", { replace: true });
      return;
    }

    setPendingOAuthProfile(oauthProfile);
    setForm((current) => ({
      ...current,
      phone: oauthProfile.phone,
      age: oauthProfile.age,
      reason: oauthProfile.reason,
    }));
    setMode("oauth-complete");
  }, [login, navigate]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const profile = pendingOAuthProfile
      ? {
          ...pendingOAuthProfile,
          phone: form.phone,
          age: form.age,
          reason: form.reason,
          provider: pendingOAuthProfile.provider || "google",
        }
      : { ...form, provider: "email" };
    setStatus("loading");
    setError("");
    try {
      const backendUser = await demoAuth(profile);
      login(backendUser);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || copy.authFailed);
      setStatus("error");
    }
  }

  function handleGoogle() {
    window.location.href = `${getApiBaseUrl()}/api/auth/google/start`;
  }

  const isRegister = mode === "register";
  const isOAuthComplete = mode === "oauth-complete";

  return (
    <main className="min-h-screen bg-earth-50 px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <section>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-forest-900 text-sm font-black text-white">
              FL
            </span>
            <div>
              <p className="text-lg font-bold text-forest-900">FoodLoop AI</p>
              <p className="text-sm text-forest-700">{t.brandSubtitle}</p>
            </div>
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.14em] text-forest-700">{t.welcomeEyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold text-forest-900 sm:text-5xl">{t.welcomeTitle}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/70">{t.welcomeDescription}</p>

          <div className="mt-8 grid gap-3 rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft sm:grid-cols-3">
            <AuthFeature icon={Leaf} title={copy.featureFoodTitle} text={copy.featureFoodText} />
            <AuthFeature icon={Lock} title={copy.featureSafetyTitle} text={copy.featureSafetyText} />
            <AuthFeature icon={Mail} title={copy.featureDataTitle} text={copy.featureDataText} />
          </div>
        </section>

        <section className="rounded-lg border border-forest-900/10 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-forest-900">{isOAuthComplete ? copy.completeTitle : isRegister ? t.registerTitle : t.loginTitle}</h2>
              <p className="mt-1 text-sm text-ink/60">{isOAuthComplete ? copy.completeDescription : isRegister ? t.registerDescription : t.loginDescription}</p>
            </div>
            <LanguageSelect compact />
          </div>

          {!isOAuthComplete && <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-earth-50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`focus-ring rounded-lg px-3 py-2 text-sm font-semibold ${!isRegister ? "bg-forest-900 text-white" : "text-ink/70"}`}
            >
              {t.continueLogin}
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`focus-ring rounded-lg px-3 py-2 text-sm font-semibold ${isRegister ? "bg-forest-900 text-white" : "text-ink/70"}`}
            >
              {t.continueRegister}
            </button>
          </div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <Field label={t.name} value={form.name} onChange={(value) => updateField("name", value)} required />
            )}
            {!isOAuthComplete && <Field label={t.email} value={form.email} onChange={(value) => updateField("email", value)} type="email" required />}
            {!isOAuthComplete && <Field label={t.password} value={form.password} onChange={(value) => updateField("password", value)} type="password" required />}
            {(isRegister || isOAuthComplete) && (
              <>
                <Field label={t.phone} value={form.phone} onChange={(value) => updateField("phone", value)} type="tel" required />
                <Field label={t.age} value={form.age} onChange={(value) => updateField("age", value)} type="number" min="1" required />
                <label className="block text-sm font-semibold text-forest-900">
                  {t.useReason}
                  <textarea
                    value={form.reason}
                    onChange={(event) => updateField("reason", event.target.value)}
                    className="focus-ring mt-2 min-h-24 w-full resize-y rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-3 text-sm"
                    placeholder={t.useReasonPlaceholder}
                    required
                  />
                </label>
              </>
            )}

            <Button type="submit" className="w-full">
              {isRegister ? <UserPlus size={18} /> : <Lock size={18} />}
              {status === "loading" ? copy.connecting : isOAuthComplete ? copy.completeButton : isRegister ? t.registerButton : t.loginButton}
            </Button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {!isOAuthComplete && <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink/40">
            <span className="h-px flex-1 bg-forest-900/10" />
            {copy.or}
            <span className="h-px flex-1 bg-forest-900/10" />
          </div>}

          {!isOAuthComplete && <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle} disabled={status === "loading"}>
            {t.googleButton}
          </Button>}

          <p className="mt-4 text-center text-xs leading-5 text-ink/55">{t.mockAuthNote}</p>
        </section>
      </div>
    </main>
  );
}

const authCopy = {
  en: {
    authFailed: "Backend auth failed.",
    connecting: "Connecting...",
    or: "or",
    featureFoodTitle: "Indonesian food",
    featureFoodText: "Custom JSON keeps recipe suggestions focused.",
    featureSafetyTitle: "Safety first",
    featureSafetyText: "Freshness and contamination checks stay visible.",
    featureDataTitle: "Useful data",
    featureDataText: "Age and reason help improve the MVP responsibly.",
    completeTitle: "Complete your profile",
    completeDescription: "Google sign-in is connected. Add your phone number and basic survey data before continuing.",
    completeButton: "Continue to FoodLoop",
  },
  id: {
    authFailed: "Auth backend gagal.",
    connecting: "Menghubungkan...",
    or: "atau",
    featureFoodTitle: "Makanan Indonesia",
    featureFoodText: "JSON kustom menjaga saran resep tetap fokus.",
    featureSafetyTitle: "Utamakan aman",
    featureSafetyText: "Cek kesegaran dan kontaminasi tetap terlihat.",
    featureDataTitle: "Data berguna",
    featureDataText: "Usia dan alasan membantu pengembangan MVP secara bertanggung jawab.",
    completeTitle: "Lengkapi profil",
    completeDescription: "Google sign-in sudah tersambung. Tambahkan nomor HP dan data singkat sebelum lanjut.",
    completeButton: "Lanjut ke FoodLoop",
  },
};

function Field({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="block text-sm font-semibold text-forest-900">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        className="focus-ring mt-2 w-full rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-3 text-sm"
        {...props}
      />
    </label>
  );
}

function AuthFeature({ icon: Icon, title, text }) {
  return (
    <div>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-forest-50 text-forest-700">
        <Icon size={20} />
      </span>
      <h2 className="mt-3 font-bold text-forest-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-ink/60">{text}</p>
    </div>
  );
}
