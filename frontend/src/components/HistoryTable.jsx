import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function HistoryTable({ rows, language = "en" }) {
  const copy = tableCopy[language] || tableCopy.en;
  return (
    <div className="overflow-hidden rounded-lg border border-forest-900/10 bg-white shadow-soft">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-forest-900 text-white">
          <tr>
            <th className="px-4 py-3">{copy.date}</th>
            <th className="px-4 py-3">{copy.type}</th>
            <th className="px-4 py-3">{copy.summary}</th>
            <th className="px-4 py-3">{copy.progress}</th>
            <th className="px-4 py-3">{copy.status}</th>
            <th className="px-4 py-3">{copy.action}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-forest-900/10">
          {rows.map((row) => (
            <tr key={`${row.type}-${row.id}`}>
              <td className="px-4 py-3">{row.date}</td>
              <td className="px-4 py-3">{row.typeLabel}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-forest-900">{row.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-ink/55">{row.description}</p>
              </td>
              <td className="px-4 py-3">{row.progress}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(row.status)}`}>
                  {copy.statusLabels[row.status] || row.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <Button as={Link} to={row.actionHref} variant={row.actionVariant || "secondary"} className="min-h-9 px-3 py-1.5">
                  {row.actionLabel}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableCopy = {
  en: {
    date: "Date",
    type: "Type",
    summary: "Summary",
    progress: "Progress",
    status: "Status",
    action: "Action",
    statusLabels: {
      finished: "Finished",
      stopped: "Stopped",
      started: "Started",
    },
  },
  id: {
    date: "Tanggal",
    type: "Tipe",
    summary: "Ringkasan",
    progress: "Progres",
    status: "Status",
    action: "Aksi",
    statusLabels: {
      finished: "Selesai",
      stopped: "Berhenti",
      started: "Dimulai",
    },
  },
};

function statusClass(status) {
  if (status === "finished") return "bg-forest-50 text-forest-700";
  if (status === "stopped") return "bg-red-50 text-red-700";
  if (status === "started") return "bg-earth-50 text-earth-700";
  return "bg-earth-50 text-ink/65";
}
