import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import { submitExperienceFeedback } from "../api/feedbackApi";
import { useApp } from "../context/AppContext.jsx";

const feedbackKey = "foodloop_feedback_prompt";
const maxPrompts = 3;
const cooldownMs = 3 * 24 * 60 * 60 * 1000;

export default function FeedbackPrompt() {
  const { language, user } = useApp();
  const copy = feedbackCopy[language] || feedbackCopy.en;
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(feedbackKey) || "{}");
    const count = stored.count || 0;
    const lastAsked = stored.lastAsked || 0;
    const hasAnswered = stored.answered;
    if (hasAnswered || count >= maxPrompts || Date.now() - lastAsked < cooldownMs) return;

    const timer = setTimeout(() => setVisible(true), 25000);
    return () => clearTimeout(timer);
  }, []);

  function savePromptState(next) {
    const stored = JSON.parse(localStorage.getItem(feedbackKey) || "{}");
    localStorage.setItem(
      feedbackKey,
      JSON.stringify({
        ...stored,
        ...next,
        count: next.answered ? stored.count || 1 : (stored.count || 0) + 1,
        lastAsked: Date.now(),
      })
    );
  }

  function dismiss() {
    savePromptState({ answered: false });
    setVisible(false);
  }

  async function submit() {
    try {
      await submitExperienceFeedback({
        user_id: user?.id || null,
        rating,
        context: "experience_prompt",
      });
    } catch {
      // Local storage still prevents repeated prompts if the network is unavailable.
    }
    savePromptState({ answered: true, rating });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:w-[360px]">
      <section className="rounded-lg border border-forest-900/10 bg-white p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-forest-900">{copy.title}</p>
            <p className="mt-1 text-sm leading-6 text-ink/65">{copy.description}</p>
          </div>
          <button type="button" onClick={dismiss} className="focus-ring rounded-lg p-1 text-ink/55 hover:bg-earth-50" aria-label={copy.close}>
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={[
                "focus-ring grid h-11 place-items-center rounded-lg border text-sm font-black transition",
                rating >= value ? "border-forest-700 bg-forest-50 text-forest-900" : "border-forest-900/10 text-ink/45 hover:bg-earth-50",
              ].join(" ")}
              aria-label={`${copy.rating} ${value}`}
            >
              <Star size={17} fill={rating >= value ? "currentColor" : "none"} />
            </button>
          ))}
        </div>

        <Button type="button" className="mt-4 w-full" onClick={submit} disabled={!rating}>
          {copy.submit}
        </Button>
      </section>
    </div>
  );
}

const feedbackCopy = {
  en: {
    title: "Are you enjoying FoodLoop?",
    description: "A quick 1-5 rating helps improve the demo without interrupting your cooking flow.",
    submit: "Send rating",
    close: "Close feedback prompt",
    rating: "Rating",
  },
  id: {
    title: "Apakah FoodLoop nyaman dipakai?",
    description: "Rating 1-5 membantu memperbaiki demo tanpa mengganggu alur memasak.",
    submit: "Kirim rating",
    close: "Tutup pertanyaan feedback",
    rating: "Rating",
  },
};
