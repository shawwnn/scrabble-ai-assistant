export interface ProcessingStage {
  label: string;
  description: string;
}

export type StageStatus = "completed" | "active" | "pending";

export const PROCESSING_STAGES: ProcessingStage[] = [
  { label: "Image Upload", description: "Receiving the uploaded screenshot." },
  {
    label: "Local Recognition",
    description: "The browser recognizes the Scrabble board locally.",
  },
  {
    label: "Coordinate Extraction",
    description: "Extracting letters and their exact row and column positions, including the rack if available.",
  },
  {
    label: "Board Data Transfer",
    description: "Sending only structured board and rack data to the backend.",
  },
  {
    label: "Move Analysis",
    description: "Backend evaluates legal horizontal and vertical placements and finds the highest-scoring possible move.",
  },
  { label: "Results Ready", description: "Redirecting to the analysis results page." },
];

/** The first two minutes are divided evenly across the six visible stages. */
export const PROCESSING_WINDOW_MS = 120_000;
export const TOTAL_PROCESSING_TIMEOUT_MS = 180_000;
export const STAGE_DURATION_MS = PROCESSING_WINDOW_MS / PROCESSING_STAGES.length;

export function getStageStatus(index: number, activeIndex: number): StageStatus {
  if (index < activeIndex) return "completed";
  if (index === activeIndex) return "active";
  return "pending";
}
