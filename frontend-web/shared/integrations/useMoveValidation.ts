import { useEffect, useRef, useState } from "react";
import { validateMoveBackend } from "../api";

type BackendValidation = {
  status: "valid" | "invalid";
  totalProjectedScore: number;
  words: unknown[];
  invalidWords: string[];
  reason: string | null;
  dictionary: string;
};

type ValidationStatus = "unchanged" | "checking" | "valid" | "invalid";

type LocalValidation = {
  status: "unchanged" | "valid" | "invalid";
  score?: number;
};

type UseMoveValidationProps = {
  currentMoveTiles: unknown;
  localValidation: LocalValidation;
};

export function useMoveValidation({
  currentMoveTiles,
  localValidation,
}: UseMoveValidationProps) {
  const [backendValidation, setBackendValidation] = useState<{
    moveKey: string;
    result: BackendValidation;
  } | null>(null);

  const requestId = useRef(0);
  const moveKey = JSON.stringify(currentMoveTiles);
  const hasTiles = Array.isArray(currentMoveTiles) && currentMoveTiles.length > 0;
  const needsBackendValidation = hasTiles && localValidation.status === "valid";

  useEffect(() => {
    const id = ++requestId.current;

    // Placement-rule errors are definitive. Do not let a stale or unnecessary
    // dictionary request override their red state.
    if (!needsBackendValidation) {
      return;
    }

    validateMoveBackend(currentMoveTiles)
      .then((result) => {
        // Ignore a response belonging to an older move.
        if (id !== requestId.current) return;

        setBackendValidation({ moveKey, result });
      })
      .catch(() => {
        // Keep the existing local UI behavior if the backend request fails.
      });
  }, [currentMoveTiles, moveKey, needsBackendValidation]);

  // Only accept a response for the current board position. A new move remains
  // disabled while its dictionary request is running.
  if (needsBackendValidation && backendValidation?.moveKey === moveKey) {
    const { result } = backendValidation;
    return {
      status: result.status as ValidationStatus,
      moveScore: result.totalProjectedScore,

      // Other backend fields
      words: result.words,
      invalidWords: result.invalidWords,
      reason: result.reason,
      dictionary: result.dictionary,
    };
  }

  if (needsBackendValidation) {
    return {
      status: "checking" as const,
      moveScore: 0,
      reason: "Checking the dictionary…",
    };
  }

  return {
    status: localValidation.status,
    moveScore: localValidation.score ?? 0,
  };
}
