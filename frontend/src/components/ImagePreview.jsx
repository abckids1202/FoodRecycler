import { useApp } from "../context/AppContext.jsx";

export default function ImagePreview({ src, alt }) {
  const { language } = useApp();
  const copy = imageCopy[language] || imageCopy.en;
  if (!src) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-lg border border-forest-900/10 bg-white text-sm text-ink/50">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-forest-900/10 bg-white shadow-soft">
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
