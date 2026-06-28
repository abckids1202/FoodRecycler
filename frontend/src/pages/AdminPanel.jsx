import { Shield, Users } from "lucide-react";
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
              <p className="mt-3 text-sm leading-6 text-white/70">{data.privacy_note}</p>
              <div className="mt-5 rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/65">{copy.reactivation}</p>
                <p className="mt-1 text-3xl font-black">{data.reminder_reactivation_rate}%</p>
              </div>
            </aside>
          </section>
        </>
      )}
    </div>
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
    reactivation: "Reminder reactivation rate",
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
    reactivation: "Tingkat reaktivasi pengingat",
  },
};
