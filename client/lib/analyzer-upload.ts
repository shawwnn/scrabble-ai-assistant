export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateScreenshot(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported file. Upload a JPG, JPEG, PNG, or WEBP image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "This image is larger than 10 MB. Choose a smaller file.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
