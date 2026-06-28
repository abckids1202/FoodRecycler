import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import BackendStatus from "./BackendStatus.jsx";
import FeedbackPrompt from "./FeedbackPrompt.jsx";
import LanguageSelect from "./LanguageSelect.jsx";

export default function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, t, language } = useApp();
  const footer = footerCopy[language] || footerCopy.en;

  const navLinks = [
    { to: "/", label: t.navHome },
    { to: "/upload", label: t.navAnalyze },
    { to: "/chat", label: t.navAssistant },
    { to: "/history", label: t.navHistory },
    { to: "/dashboard", label: t.navDashboard },
  ];

  return (
    <div className="min-h-screen bg-earth-50 text-ink">
      <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-earth-50/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forest-900 text-xs font-black text-white sm:h-10 sm:w-10 sm:text-sm">
              FL
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold leading-5">FoodLoop AI</span>
              <span className="hidden text-xs text-forest-700 sm:block">{t.brandSubtitle}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "focus-ring rounded-lg px-3 py-2 text-sm font-semibold transition",
                    isActive ? "bg-forest-900 text-white" : "text-ink/70 hover:bg-white hover:text-forest-900",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
            <LanguageSelect compact />
            <button
              type="button"
              onClick={logout}
              className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white hover:text-forest-900"
            >
              {t.navLogout}
            </button>
          </nav>

          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-forest-900/10 bg-white md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-forest-900/10 bg-earth-50 px-4 py-3 md:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "focus-ring rounded-lg px-3 py-2 text-sm font-semibold transition",
                      isActive ? "bg-forest-900 text-white" : "text-ink/70 hover:bg-white hover:text-forest-900",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="rounded-lg bg-white p-3">
                <LanguageSelect />
              </div>
              <button
                type="button"
                onClick={logout}
                className="focus-ring rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink/70 hover:bg-white hover:text-forest-900"
              >
                {t.navLogout}
              </button>
            </div>
          </nav>
        )}
      </header>
      <BackendStatus />

      <main className="mx-auto min-w-0 max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      <footer className="mt-8 border-t border-forest-900/10 bg-white/65">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 text-sm text-ink/65 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
          <div>
            <p className="font-bold text-forest-900">FoodLoop AI</p>
            <p className="mt-2 leading-6">{footer.description}</p>
          </div>
          <div>
            <p className="font-bold text-forest-900">{footer.safetyTitle}</p>
            <p className="mt-2 leading-6">{footer.safetyText}</p>
          </div>
          <div>
            <p className="font-bold text-forest-900">{footer.legalTitle}</p>
            <p className="mt-2 leading-6">{footer.legalText}</p>
          </div>
        </div>
      </footer>
      <FeedbackPrompt />
    </div>
  );
}

const footerCopy = {
  en: {
    description: "Indonesian leftover assistant for safer reuse, recipe ideas, and cooking progress tracking.",
    safetyTitle: "Safety notice",
    safetyText: "AI can make mistakes. Always check smell, texture, storage time, allergies, and reheating safety before eating leftovers.",
    legalTitle: "Privacy & demo use",
    legalText: "This prototype stores basic profile, analysis, cooking, and feedback data for product testing. Do not use it as medical advice.",
  },
  id: {
    description: "Asisten leftover Indonesia untuk pemanfaatan lebih aman, ide resep, dan pelacakan progres memasak.",
    safetyTitle: "Catatan keamanan",
    safetyText: "AI bisa keliru. Selalu cek bau, tekstur, waktu penyimpanan, alergi, dan keamanan pemanasan ulang sebelum makan leftover.",
    legalTitle: "Privasi & penggunaan demo",
    legalText: "Prototipe ini menyimpan profil dasar, analisis, memasak, dan feedback untuk pengujian produk. Ini bukan nasihat medis.",
  },
};
