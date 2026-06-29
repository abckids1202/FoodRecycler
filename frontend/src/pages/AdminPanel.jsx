import { FileText, LockKeyhole, Scale, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { getAdminSummary } from "../api/adminApi";
import { useApp } from "../context/AppContext.jsx";

export default function AdminPanel() {
  const { user, language } = useApp();
  const copy = adminCopy[language] || adminCopy.en;
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const result = await getAdminSummary(user.email);
        if (!mounted) return;
        setData(result);
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
  }, [user.email]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {status === "loading" && <LoadingState title={copy.loading} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && data && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.totals.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} hint={copy.metricHint} />
            ))}
          </section>
          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-lg font-bold text-forest-900">
                <Users size={20} /> {copy.recentUsers}
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-ink/45">
                    <tr>
                      <th className="py-2">User</th>
                      <th>Email</th>
                      <th>Provider</th>
                      <th>Reminder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_users.map((item) => (
                      <tr key={item.id} className="border-t border-forest-900/10">
                        <td className="py-3 font-semibold text-forest-900">{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.provider}</td>
                        <td>{item.reminder_channel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <aside className="rounded-lg border border-forest-900/10 bg-forest-900 p-5 text-white shadow-soft">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Shield size={20} /> {copy.privacyTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{copy.privacyNote}</p>
              <div className="mt-5 rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/65">{copy.reactivation}</p>
                <p className="mt-1 text-3xl font-black">{data.reminder_reactivation_rate}%</p>
              </div>
            </aside>
          </section>
          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-forest-700">{copy.safetyEyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold text-forest-900">{copy.safetyTitle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{copy.safetyDescription}</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700">
                <FileText size={24} />
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <SafetyCard icon={Scale} title={copy.dataPurposeTitle} items={copy.dataPurposeItems} />
              <SafetyCard icon={LockKeyhole} title={copy.dataProtectionTitle} items={copy.dataProtectionItems} />
              <SafetyCard icon={Shield} title={copy.userControlTitle} items={copy.userControlItems} />
            </div>
            <div className="mt-5 rounded-lg border border-earth-500/20 bg-earth-50 p-4 text-sm leading-6 text-ink/70">
              <strong className="text-forest-900">{copy.aiSafetyLabel}</strong> {copy.aiSafetyText}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SafetyCard({ icon: Icon, title, items }) {
  return (
    <article className="rounded-lg border border-forest-900/10 bg-earth-50 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-forest-700">
        <Icon size={20} />
      </span>
      <h3 className="mt-3 font-bold text-forest-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/65">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-earth-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

const adminCopy = {
  en: {
    eyebrow: "Developer view",
    title: "Admin analytics panel",
    description: "Transparent app usage, reminder, and cooking follow-through metrics for the team.",
    loading: "Loading admin panel",
    loadingMessage: "Reading product analytics.",
    errorTitle: "Admin access error",
    metricHint: "All users",
    recentUsers: "Recent users",
    privacyTitle: "Privacy guard",
    privacyNote:
      "Admin data is limited to product analytics fields. Do not expose OpenAI keys, Google secrets, passwords, or raw private messages.",
    reactivation: "Reminder reactivation rate",
    safetyEyebrow: "Transparency",
    safetyTitle: "Data safety and responsible-use statement",
    safetyDescription:
      "This panel helps the team explain why FoodLoop collects data and how the prototype avoids misuse during testing and competition demos.",
    dataPurposeTitle: "Why data is needed",
    dataPurposeItems: [
      "Profile data helps understand who uses the app and improve accessibility.",
      "Leftover and recipe data powers dashboard statistics and food-waste impact tracking.",
      "Reminder consent data prevents spam and limits outreach to opted-in users only.",
    ],
    dataProtectionTitle: "What we do not do",
    dataProtectionItems: [
      "FoodLoop does not sell user data.",
      "Secrets, API keys, and passwords are never shown in this admin panel.",
      "Developer analytics are limited to product usage and safety-relevant fields.",
    ],
    userControlTitle: "User control",
    userControlItems: [
      "Users can disable reminders from the reminder settings page.",
      "Reminder outreach stops automatically after three days.",
      "Unsafe food guidance prioritizes health over recipe suggestions.",
    ],
    aiSafetyLabel: "AI safety note:",
    aiSafetyText:
      "FoodLoop uses AI and local food-safety rules, so outputs can be wrong. Users must still inspect smell, texture, storage time, allergens, and reheating safety before eating leftovers.",
  },
  id: {
    eyebrow: "Tampilan developer",
    title: "Panel analitik admin",
    description: "Metrik penggunaan aplikasi, pengingat, dan tindak lanjut memasak untuk tim secara transparan.",
    loading: "Memuat panel admin",
    loadingMessage: "Mengambil analitik produk.",
    errorTitle: "Error akses admin",
    metricHint: "Semua user",
    recentUsers: "User terbaru",
    privacyTitle: "Penjaga privasi",
    privacyNote:
      "Data admin dibatasi pada analitik produk. Jangan tampilkan kunci OpenAI, rahasia Google, kata sandi, atau pesan pribadi mentah.",
    reactivation: "Tingkat reaktivasi pengingat",
    safetyEyebrow: "Transparansi",
    safetyTitle: "Pernyataan keamanan data dan penggunaan bertanggung jawab",
    safetyDescription:
      "Panel ini membantu tim menjelaskan alasan FoodLoop mengumpulkan data dan bagaimana prototipe mencegah penyalahgunaan saat pengujian dan demo kompetisi.",
    dataPurposeTitle: "Mengapa data dibutuhkan",
    dataPurposeItems: [
      "Data profil membantu memahami pengguna dan meningkatkan aksesibilitas aplikasi.",
      "Data leftover dan resep digunakan untuk statistik dashboard dan dampak pengurangan food waste.",
      "Data persetujuan pengingat mencegah spam dan membatasi pesan hanya untuk user yang setuju.",
    ],
    dataProtectionTitle: "Yang tidak kami lakukan",
    dataProtectionItems: [
      "FoodLoop tidak menjual data pengguna.",
      "Secret, API key, dan kata sandi tidak pernah ditampilkan di panel admin.",
      "Analitik developer dibatasi pada penggunaan produk dan data yang relevan dengan keamanan.",
    ],
    userControlTitle: "Kontrol user",
    userControlItems: [
      "User dapat mematikan pengingat dari halaman pengaturan pengingat.",
      "Pesan pengingat berhenti otomatis setelah tiga hari.",
      "Panduan makanan tidak aman selalu mengutamakan kesehatan dibanding rekomendasi resep.",
    ],
    aiSafetyLabel: "Catatan keamanan AI:",
    aiSafetyText:
      "FoodLoop memakai AI dan aturan keamanan pangan lokal, sehingga hasil bisa keliru. User tetap harus memeriksa bau, tekstur, waktu penyimpanan, alergen, dan keamanan pemanasan ulang sebelum memakan leftover.",
  },
};
