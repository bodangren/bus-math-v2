"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { LanguageMode } from "@/lib/study/types";
import type { GlossaryTerm } from "@/lib/study/glossary";

export function useStudyPreferences() {
  const preferences = useQuery(api.study.getStudyPreferences);
  const updatePreferences = useMutation(api.study.updatePreferences);

  return {
    preferences,
    updatePreferences,
    languageMode: (preferences?.languageMode ?? "en_to_en") as LanguageMode,
  };
}

export function useTermMastery(unitNumber?: number) {
  return useQuery(api.study.getTermMasteryByUnit, { unitNumber: unitNumber ?? undefined });
}

export function useDueTerms() {
  return useQuery(api.study.getDueTerms);
}

export function useRecentSessions(limit?: number) {
  return useQuery(api.study.getRecentSessions, limit ? { limit } : "skip");
}

export function useProcessReview() {
  return useMutation(api.study.processReview);
}

export function useRecordSession() {
  return useMutation(api.study.recordSession);
}

export function useExportData() {
  return useQuery(api.study.getExportData);
}

export function usePracticeTestResults(unitNumber?: number) {
  return useQuery(api.study.getPracticeTestResults, unitNumber !== undefined ? { unitNumber } : "skip");
}

export function useSavePracticeTestResult() {
  return useMutation(api.study.savePracticeTestResult);
}

export function getGlossaryTermDisplay(term: GlossaryTerm, languageMode: LanguageMode) {
  switch (languageMode) {
    case "en_to_en":
      return {
        prompt: term.term_en,
        answer: term.def_en,
      };
    case "en_to_zh":
      return {
        prompt: term.term_en,
        answer: term.term_zh,
      };
    case "zh_to_en":
      return {
        prompt: term.term_zh,
        answer: term.term_en,
      };
    case "zh_to_zh":
      return {
        prompt: term.term_zh,
        answer: term.def_zh,
      };
    default:
      return {
        prompt: term.term_en,
        answer: term.def_en,
      };
  }
}
