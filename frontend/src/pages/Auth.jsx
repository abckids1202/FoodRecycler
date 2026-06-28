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
    phoneCountryCode: "+62",
    phone: "",
    password: "",
    age: "",
    reason: "",
    reminderOptIn: false,
    reminderChannel: "email",
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
      phoneCountryCode: params.get("oauth_phone_country_code") || "+62",
      age: params.get("oauth_age") || "",
      reason: params.get("oauth_reason") || "",
      reminderOptIn: params.get("oauth_reminder_opt_in") === "1",
      reminderChannel: params.get("oauth_reminder_channel") || "none",
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
      phoneCountryCode: oauthProfile.phoneCountryCode,
      age: oauthProfile.age,
      reason: oauthProfile.reason,
      reminderOptIn: oauthProfile.reminderOptIn,
      reminderChannel: oauthProfile.reminderChannel === "none" ? "email" : oauthProfile.reminderChannel,
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
          phoneCountryCode: form.phoneCountryCode,
          age: form.age,
          reason: form.reason,
          reminderOptIn: form.reminderOptIn,
          reminderChannel: form.reminderOptIn ? form.reminderChannel : "none",
          provider: pendingOAuthProfile.provider || "google",
        }
      : { ...form, provider: "email", reminderChannel: form.reminderOptIn ? form.reminderChannel : "none" };
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
                <PhoneField
                  label={t.phone}
                  countryCode={form.phoneCountryCode}
                  phone={form.phone}
                  onCountryChange={(value) => updateField("phoneCountryCode", value)}
                  onPhoneChange={(value) => updateField("phone", value)}
                  copy={copy}
                />
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
                <ReminderConsent
                  copy={copy}
                  enabled={form.reminderOptIn}
                  channel={form.reminderChannel}
                  onEnabledChange={(value) => updateField("reminderOptIn", value)}
                  onChannelChange={(value) => updateField("reminderChannel", value)}
                />
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
    countryCode: "Country",
    phonePlaceholder: "81234567890",
    reminderTitle: "Gentle reminders",
    reminderText: "Optional. FoodLoop may remind you for up to 3 days, then stops automatically.",
    reminderOptIn: "Send me non-spam reminders",
    reminderChannel: "Reminder channel",
    emailOnly: "Email",
    whatsappOnly: "WhatsApp",
    bothChannels: "Email + WhatsApp",
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
    countryCode: "Negara",
    phonePlaceholder: "81234567890",
    reminderTitle: "Pengingat ringan",
    reminderText: "Opsional. FoodLoop dapat mengingatkan maksimal 3 hari, lalu berhenti otomatis.",
    reminderOptIn: "Kirim pengingat tanpa spam",
    reminderChannel: "Channel pengingat",
    emailOnly: "Email",
    whatsappOnly: "WhatsApp",
    bothChannels: "Email + WhatsApp",
  },
};

const countries = [
  { code: "+62", label: "Indonesia (+62)" },
  { code: "+1", label: "United States (+1)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+63", label: "Philippines (+63)" },
];

function PhoneField({ label, countryCode, phone, onCountryChange, onPhoneChange, copy }) {
  return (
    <fieldset className="block text-sm font-semibold text-forest-900">
      <legend>{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-[180px_1fr]">
        <select
          value={countryCode}
          onChange={(event) => onCountryChange(event.target.value)}
          className="focus-ring w-full rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-3 text-sm"
          aria-label={copy.countryCode}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.label}</option>
          ))}
        </select>
        <input
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          type="tel"
          className="focus-ring w-full rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-3 text-sm"
          placeholder={copy.phonePlaceholder}
          required
        />
      </div>
    </fieldset>
  );
}

function ReminderConsent({ copy, enabled, channel, onEnabledChange, onChannelChange }) {
  return (
    <section className="rounded-lg border border-forest-900/10 bg-forest-50 p-4">
      <div className="flex items-start gap-3">
        <input
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-forest-900/20"
        />
        <label className="text-sm">
          <span className="block font-bold text-forest-900">{copy.reminderOptIn}</span>
          <span className="mt-1 block leading-5 text-ink/65">{copy.reminderText}</span>
        </label>
      </div>
      {enabled && (
        <label className="mt-3 block text-sm font-semibold text-forest-900">
          {copy.reminderChannel}
          <select
            value={channel}
            onChange={(event) => onChannelChange(event.target.value)}
            className="focus-ring mt-2 w-full rounded-lg border border-forest-900/10 bg-white px-3 py-3 text-sm"
          >
            <option value="email">{copy.emailOnly}</option>
            <option value="whatsapp">{copy.whatsappOnly}</option>
            <option value="email_whatsapp">{copy.bothChannels}</option>
          </select>
        </label>
      )}
    </section>
  );
}

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
