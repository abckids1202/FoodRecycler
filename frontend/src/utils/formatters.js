export function formatPercent(value) {
  if (value === null || value === undefined) return "0%";
  return `${Math.round(value)}%`;
}

export function formatConfidence(value) {
  if (value === null || value === undefined) return "Unknown";
  return `${Math.round(value * 100)}%`;
}

export function titleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
