import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CapstoneProject } from "@/types/capstone";

export type SuggestionType = "adviser" | "panel" | "coordinator" | "keyword";

const COLLECTION = "suggestions";

/** Requires a composite index: type ASC, valueLower ASC (Firestore will link from the console error). */
export async function queryStoredSuggestions(
  type: SuggestionType,
  prefix: string,
  max = 10
): Promise<string[]> {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];

  const col = collection(db, COLLECTION);
  const q = query(
    col,
    where("type", "==", type),
    orderBy("valueLower"),
    startAt(p),
    endAt(`${p}\uf8ff`),
    limit(max)
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => String(d.data().value ?? ""));
  } catch {
    // Missing composite index or permission issue — still use project-derived matches.
    return [];
  }
}

export function extractStringsFromProjects(
  projects: CapstoneProject[],
  kind: SuggestionType
): Set<string> {
  const out = new Set<string>();
  for (const p of projects) {
    if (kind === "adviser") {
      const v = p.adviser?.trim();
      if (v) out.add(v);
    } else if (kind === "coordinator") {
      const v = p.thesisCoordinator?.trim();
      if (v) out.add(v);
    } else if (kind === "panel") {
      for (const m of p.panelMembers ?? []) {
        const v = m?.trim();
        if (v) out.add(v);
      }
    } else if (kind === "keyword") {
      for (const k of p.keywords ?? []) {
        const v = k?.trim();
        if (!v) continue;
        if (v.includes(",")) {
          for (const part of v.split(",").map((x) => x.trim()).filter(Boolean)) {
            out.add(part);
          }
        } else {
          out.add(v);
        }
      }
    }
  }
  return out;
}

export function filterCatalogMatches(
  candidates: Iterable<string>,
  needle: string,
  max: number
): string[] {
  const n = needle.trim().toLowerCase();
  if (!n) return [];

  const matches: string[] = [];
  for (const s of candidates) {
    if (!s) continue;
    if (s.toLowerCase().includes(n)) matches.push(s);
  }

  matches.sort((a, b) => {
    const ai = a.toLowerCase().indexOf(n);
    const bi = b.toLowerCase().indexOf(n);
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });

  return matches.slice(0, max);
}

/** Split comma-joined keyword blobs into individual tokens (deduped, order preserved). */
export function expandKeywordTokens(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const s = raw?.trim();
    if (!s) continue;
    const parts = s.includes(",")
      ? s.split(",").map((p) => p.trim()).filter(Boolean)
      : [s];
    for (const p of parts) {
      const k = p.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(p);
    }
  }
  return out;
}

function mergeUniqueOrdered(primary: string[], secondary: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const lowerSeen = new Set<string>();

  const push = (s: string) => {
    const k = s.toLowerCase();
    if (lowerSeen.has(k)) return;
    lowerSeen.add(k);
    seen.add(s);
    out.push(s);
  };

  for (const s of primary) {
    if (out.length >= max) break;
    push(s);
  }
  for (const s of secondary) {
    if (out.length >= max) break;
    push(s);
  }
  return out;
}

export async function fetchMergedSuggestions(
  type: SuggestionType,
  search: string,
  projects: CapstoneProject[] | undefined,
  max = 10
): Promise<string[]> {
  const needle = search.trim();
  if (!needle) return [];

  const fromStoreRaw = await queryStoredSuggestions(type, needle, max);
  const fromStore =
    type === "keyword"
      ? filterCatalogMatches(expandKeywordTokens(fromStoreRaw), needle, max)
      : fromStoreRaw;

  const fromProjects = projects?.length
    ? filterCatalogMatches(extractStringsFromProjects(projects, type), needle, max)
    : [];

  return mergeUniqueOrdered(fromStore, fromProjects, max);
}

export async function persistSuggestion(type: SuggestionType, value: string): Promise<void> {
  const v = value.trim();
  if (!v) return;

  const valueLower = v.toLowerCase();
  const col = collection(db, COLLECTION);
  const dup = query(
    col,
    where("type", "==", type),
    where("valueLower", "==", valueLower),
    limit(1)
  );
  const snap = await getDocs(dup);
  if (!snap.empty) return;

  await addDoc(col, {
    type,
    value: v,
    valueLower,
  });
}
