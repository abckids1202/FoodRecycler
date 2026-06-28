import { ImagePlus } from "lucide-react";
import { useCallback, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function UploadBox({ onFileSelected, selectedFile }) {
  const { language } = useApp();
  const copy = uploadBoxCopy[language] || uploadBoxCopy.en;
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <label
      className={[
        "focus-ring flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-6 py-12 text-center shadow-soft transition",
        isDragging ? "border-forest-700 bg-forest-50" : "border-forest-900/20 hover:border-forest-500",
      ].join(" ")}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      tabIndex={0}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
      <span className="grid h-14 w-14 place-items-center rounded-lg bg-forest-50 text-forest-700">
        <ImagePlus size={26} />
      </span>
      <span className="mt-4 text-base font-semibold text-forest-900">
        {selectedFile ? selectedFile.name : copy.dropText}
      </span>
      <span className="mt-2 text-sm text-ink/60">{copy.helper}</span>
    </label>
  );
}

const uploadBoxCopy = {
  en: {
    dropText: "Drop a leftover image or browse",
    helper: "JPG, PNG, or WEBP. Add condition before analysis.",
  },
  id: {
    dropText: "Tarik foto leftover ke sini atau pilih file",
    helper: "JPG, PNG, atau WEBP. Tambahkan kondisi sebelum analisis.",
  },
};
