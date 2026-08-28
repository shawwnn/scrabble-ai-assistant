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
  const [backendValidation, setBackendValidation] =
    useState<BackendValidation | null>(null);

  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    // New move → immediately fall back to the current local result.
    setBackendValidation(null);

    // Nothing to validate yet.
    if (
      !currentMoveTiles ||
      !Array.isArray(currentMoveTiles) ||
      currentMoveTiles.length === 0
    ) {
      return;
    }

    validateMoveBackend(currentMoveTiles)
      .then((result) => {
        // Ignore a response belonging to an older move.
        if (id !== requestId.current) return;

        setBackendValidation(result);
      })
      .catch(() => {
        // Keep the existing local UI behavior if the backend request fails.
      });
  }, [currentMoveTiles]);

  // Backend overrides local state as soon as its response arrives.
  if (backendValidation) {
    return {
      status: backendValidation.status,
      moveScore: backendValidation.totalProjectedScore,

      // Other backend fields
      words: backendValidation.words,
      invalidWords: backendValidation.invalidWords,
      reason: backendValidation.reason,
      dictionary: backendValidation.dictionary,
    };
  }

  return {
    status: localValidation.status,
    moveScore: localValidation.score ?? 0,
  };
}
