export function fileToPreviewUrl(file) {
  if (!file) return null;
  return URL.createObjectURL(file);
}

export function dataUrlToFile(dataUrl, filename = "camera-capture.jpg") {
  const [metadata, content] = dataUrl.split(",");
  const mimeType = metadata.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], filename, { type: mimeType });
}
