import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../api/client";
import { useApp } from "../context/AppContext.jsx";

export default function BackendStatus() {
  const { language } = useApp();
  const copy = statusCopy[language] || statusCopy.en;
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    fetch(`${getApiBaseUrl()}/api/health`, { signal: controller.signal })
      .then((response) => setStatus(response.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"))
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (status !== "offline") return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-semibold">{copy.title}</span>
        <span>{copy.message} <code>uvicorn app.main:app --reload --host 127.0.0.1 --port 8000</code></span>
      </div>
    </div>
  );
}

const statusCopy = {
  en: {
    title: "Backend is not connected.",
    message: "Run FastAPI in the backend:",
  },
  id: {
    title: "Backend belum terhubung.",
    message: "Jalankan FastAPI di backend:",
  },
};
