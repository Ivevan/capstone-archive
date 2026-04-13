import { useCallback, useEffect, useRef, useState } from "react";
import type { CapstoneProject } from "@/types/capstone";
import {
  fetchMergedSuggestions,
  type SuggestionType,
} from "@/lib/suggestions";

const DEBOUNCE_MS = 300;

export function useMergedSuggestions(
  type: SuggestionType,
  search: string,
  projects: CapstoneProject[] | undefined,
  enabled: boolean
) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  const runFetch = useCallback(
    async (needle: string) => {
      const id = ++reqId.current;
      if (!needle.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const next = await fetchMergedSuggestions(type, needle, projects, 10);
        if (reqId.current === id) setSuggestions(next);
      } finally {
        if (reqId.current === id) setLoading(false);
      }
    },
    [type, projects]
  );

  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const needle = search;
    if (!needle.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const t = window.setTimeout(() => {
      void runFetch(needle);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(t);
    };
  }, [search, enabled, runFetch]);

  return { suggestions, loading, setSuggestions };
}
