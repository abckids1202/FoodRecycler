import { Download } from "lucide-react";
import Button from "./Button.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function PdfDownloadButton({ href }) {
  const { language } = useApp();
  const label = language === "id" ? "Unduh PDF" : "Download PDF";
  return (
    <Button as="a" href={href} target="_blank" rel="noreferrer">
      <Download size={17} />
      {label}
    </Button>
  );
}
