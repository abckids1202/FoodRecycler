import { Bell, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { disableNotificationPreferences, getNotificationPreferences, getReminderPreview, saveNotificationPreferences } from "../api/notificationApi";
import { useApp } from "../context/AppContext.jsx";

export default function ReminderSettings() {
  const { user, language } = useApp();
  const copy = reminderCopy[language] || reminderCopy.en;
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]);
  const [form, setForm] = useState({ email: false, whatsapp: false });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [prefs, messages] = await Promise.all([getNotificationPreferences(user.id), getReminderPreview()]);
        if (!mounted) return;
        setForm({ email: prefs.email_enabled, whatsapp: prefs.whatsapp_enabled });
        setPreview(messages);
        setStatus("ready");
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError.response?.data?.detail || requestError.message);
        setStatus("error");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  async function save() {
    setStatus("saving");
    try {
      await saveNotificationPreferences({
        user_id: user.id,
        email_enabled: form.email,
        whatsapp_enabled: form.whatsapp,
        consent_text: copy.consentText,
      });
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
      setStatus("error");
    }
  }

  async function disable() {
    setStatus("saving");
    try {
      await disableNotificationPreferences(user.id);
      setForm({ email: false, whatsapp: false });
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {status === "loading" && <LoadingState title={copy.loading} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status !== "loading" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-bold text-forest-900">
              <Bell size={20} /> {copy.preferences}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">{copy.stopRule}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ToggleCard icon={Mail} title={copy.email} active={form.email} onClick={() => setForm((current) => ({ ...current, email: !current.email }))} />
              <ToggleCard icon={MessageCircle} title={copy.whatsapp} active={form.whatsapp} onClick={() => setForm((current) => ({ ...current, whatsapp: !current.whatsapp }))} />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={save} disabled={status === "saving"}>{copy.save}</Button>
              <Button type="button" variant="secondary" onClick={disable} disabled={status === "saving"}>{copy.disable}</Button>
            </div>
          </section>
          <aside className="rounded-lg border border-forest-900/10 bg-forest-900 p-5 text-white shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck size={20} /> {copy.previewTitle}
            </h2>
            <div className="mt-4 space-y-3">
              {preview.map((item) => (
                <article key={item.stage} className="rounded-lg bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-forest-100">Day {item.stage}</p>
                  <p className="mt-1 font-bold">{item.subject}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.message}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function ToggleCard({ icon: Icon, title, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring rounded-lg border p-4 text-left transition ${active ? "border-forest-700 bg-forest-50" : "border-forest-900/10 bg-earth-50"}`}
    >
      <Icon size={22} className="text-forest-700" />
      <p className="mt-3 font-bold text-forest-900">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{active ? "On" : "Off"}</p>
    </button>
  );
}

const reminderCopy = {
  en: {
    eyebrow: "Reminder controls",
    title: "Non-spam reminder settings",
    description: "Choose how FoodLoop may remind you to check leftovers. Reminders stop after 3 days.",
    loading: "Loading reminders",
    loadingMessage: "Reading your reminder preferences.",
    errorTitle: "Reminder backend error",
    preferences: "Channels",
    stopRule: "FoodLoop sends at most one reminder per day for 1-3 days, then stops automatically.",
    email: "Email",
    whatsapp: "WhatsApp",
    save: "Save preferences",
    disable: "Disable reminders",
    previewTitle: "Message preview",
    consentText: "User explicitly enabled FoodLoop reminders from settings.",
  },
  id: {
    eyebrow: "Kontrol pengingat",
    title: "Pengingat tanpa spam",
    description: "Pilih cara FoodLoop mengingatkan Anda untuk mengecek leftover. Pengingat berhenti setelah 3 hari.",
    loading: "Memuat pengingat",
    loadingMessage: "Mengambil preferensi pengingat Anda.",
    errorTitle: "Error backend pengingat",
    preferences: "Channel",
    stopRule: "FoodLoop mengirim maksimal satu pengingat per hari selama 1-3 hari, lalu berhenti otomatis.",
    email: "Email",
    whatsapp: "WhatsApp",
    save: "Simpan preferensi",
    disable: "Matikan pengingat",
    previewTitle: "Pratinjau pesan",
    consentText: "User explicitly enabled FoodLoop reminders from settings.",
  },
};
