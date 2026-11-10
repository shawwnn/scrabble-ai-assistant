let selectedScreenshot: File | null = null;
const listeners = new Set<() => void>();

export function getSelectedScreenshot(): File | null {
  return selectedScreenshot;
}

export function setSelectedScreenshot(file: File | null): void {
  selectedScreenshot = file;
  listeners.forEach((listener) => listener());
}

export function subscribeToSelectedScreenshot(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
