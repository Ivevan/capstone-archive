import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CapstoneProject } from "@/types/capstone";
import { persistSuggestion, type SuggestionType } from "@/lib/suggestions";
import { useMergedSuggestions } from "@/hooks/useMergedSuggestions";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightMatches({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <span>{text}</span>;
  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function keywordTokenTail(full: string): string {
  const lastComma = full.lastIndexOf(",");
  const tail = lastComma === -1 ? full : full.slice(lastComma + 1);
  return tail.trimStart();
}

function mergeKeywordPick(full: string, selected: string): string {
  const lastComma = full.lastIndexOf(",");
  const before = lastComma === -1 ? "" : full.slice(0, lastComma + 1);
  const trimmedBefore = before.trimEnd();
  if (trimmedBefore === "") return selected;
  const spacer = trimmedBefore.endsWith(",") ? " " : ", ";
  return `${trimmedBefore}${spacer}${selected}`;
}

/**
 * If a suggestion is a comma-joined blob (legacy data), only insert the segment
 * that matches what the user typed for the current token.
 */
function narrowKeywordSelection(selected: string, needle: string): string {
  const raw = selected.trim();
  if (!raw.includes(",")) return raw;
  const n = needle.trim().toLowerCase();
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return raw;
  if (!n) return parts[0];
  const match = parts.find(
    (p) =>
      p.toLowerCase().includes(n) ||
      n.includes(p.toLowerCase())
  );
  return (match ?? parts[0]).trim();
}

export interface AutocompleteInputProps {
  type: SuggestionType;
  value: string;
  onChange: (value: string) => void;
  projects?: CapstoneProject[];
  /** When false, skips Firestore / merge fetches (e.g. dialog closed). */
  fetchEnabled?: boolean;
  /** Keywords field: match against the segment after the last comma. */
  keywordsMode?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

export function AutocompleteInput({
  type,
  value,
  onChange,
  projects,
  fetchEnabled = true,
  keywordsMode = false,
  placeholder,
  className,
  id: idProp,
  disabled,
  "aria-invalid": ariaInvalid,
}: AutocompleteInputProps) {
  const reactId = useId();
  const listId = `${reactId}-list`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchNeedle = keywordsMode ? keywordTokenTail(value) : value;
  const enabled =
    fetchEnabled && !disabled && searchNeedle.trim().length > 0;

  const { suggestions, loading } = useMergedSuggestions(
    type,
    searchNeedle,
    projects,
    enabled
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedNeedle = searchNeedle.trim();
  const hasExact = suggestions.some(
    (s) => s.toLowerCase() === trimmedNeedle.toLowerCase()
  );
  const showAddNew =
    trimmedNeedle.length > 0 && !hasExact && !loading;

  const totalRows = suggestions.length + (showAddNew ? 1 : 0);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  const pick = useCallback(
    async (picked: string, persistNew: boolean) => {
      let v = picked.trim();
      if (!v) return;
      if (keywordsMode) {
        v = narrowKeywordSelection(v, searchNeedle);
        if (!v) return;
      }
      if (persistNew) await persistSuggestion(type, v);
      if (keywordsMode) onChange(mergeKeywordPick(value, v));
      else onChange(v);
      close();
    },
    [type, value, onChange, keywordsMode, close, searchNeedle]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp") && trimmedNeedle) {
      setOpen(true);
      setActiveIndex(0);
      e.preventDefault();
      return;
    }

    if (!open) {
      if (e.key === "Enter" && trimmedNeedle) {
        e.preventDefault();
        void pick(trimmedNeedle, true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (totalRows === 0 ? -1 : (i + 1) % totalRows));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        totalRows === 0 ? -1 : (i - 1 + totalRows) % totalRows
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        void pick(suggestions[activeIndex], false);
        return;
      }
      if (showAddNew && activeIndex === suggestions.length) {
        void pick(trimmedNeedle, true);
        return;
      }
      if (activeIndex < 0 && suggestions.length === 1) {
        void pick(suggestions[0], false);
        return;
      }
      if (activeIndex < 0 && showAddNew) {
        void pick(trimmedNeedle, true);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        id={idProp}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        role="combobox"
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (searchNeedle.trim()) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {open && trimmedNeedle.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto"
        >
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Loading suggestions…
            </div>
          )}

          {!loading && suggestions.length === 0 && !showAddNew && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No results found
            </div>
          )}

          {!loading && suggestions.length === 0 && showAddNew && (
            <div className="px-3 py-2 text-sm text-muted-foreground border-b">
              No results found
            </div>
          )}

          {suggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              type="button"
              role="option"
              aria-selected={activeIndex === i}
              className={cn(
                "flex w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                activeIndex === i && "bg-accent text-accent-foreground"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void pick(s, false)}
            >
              <HighlightMatches text={s} query={searchNeedle} />
            </button>
          ))}

          {showAddNew && (
            <button
              type="button"
              role="option"
              aria-selected={activeIndex === suggestions.length}
              className={cn(
                "flex w-full px-3 py-2 text-left text-sm border-t text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                activeIndex === suggestions.length &&
                  "bg-accent text-accent-foreground"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void pick(trimmedNeedle, true)}
            >
              Add new:{" "}
              <span className="text-foreground font-medium">
                {trimmedNeedle}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
