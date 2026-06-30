import { useApp } from "../context/AppContext.jsx";

export default function ImagePreview({ src, alt }) {
  const { language } = useApp();
  const copy = imageCopy[language] || imageCopy.en;
  if (!src) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-3xl border border-forest-900/10 bg-white p-5 text-center text-sm leading-6 text-ink/50">
        <span>{copy.empty}</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-forest-900/10 bg-white shadow-soft">
      <img src={src} alt={alt || copy.alt} className="aspect-[4/3] w-full object-cover" />
    </div>
  );
}

const imageCopy = {
  en: {
    empty: "No image selected",
    alt: "Leftover preview",
  },
  id: {
    empty: "Belum ada gambar dipilih",
    alt: "Pratinjau leftover",
  },
};
