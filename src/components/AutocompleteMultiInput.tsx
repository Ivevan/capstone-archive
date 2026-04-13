import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
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

function hasMember(list: string[], candidate: string): boolean {
  const c = candidate.trim().toLowerCase();
  return list.some((m) => m.trim().toLowerCase() === c);
}

export interface AutocompleteMultiInputProps {
  type: SuggestionType;
  value: string[];
  onChange: (value: string[]) => void;
  projects?: CapstoneProject[];
  fetchEnabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function AutocompleteMultiInput({
  type,
  value,
  onChange,
  projects,
  fetchEnabled = true,
  placeholder,
  className,
  id: idProp,
  disabled,
}: AutocompleteMultiInputProps) {
  const reactId = useId();
  const listId = `${reactId}-list`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState("");
  const enabled =
    fetchEnabled && !disabled && draft.trim().length > 0;

  const { suggestions, loading } = useMergedSuggestions(
    type,
    draft,
    projects,
    enabled
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedDraft = draft.trim();
  const hasExactInList = suggestions.some(
    (s) => s.toLowerCase() === trimmedDraft.toLowerCase()
  );
  const alreadySelected = hasMember(value, trimmedDraft);
  const showAddNew =
    trimmedDraft.length > 0 &&
    !hasExactInList &&
    !alreadySelected &&
    !loading;

  const totalRows = suggestions.length + (showAddNew ? 1 : 0);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const addMember = useCallback(
    async (label: string, persistNew: boolean) => {
      const v = label.trim();
      if (!v) return;
      if (hasMember(value, v)) {
        setDraft("");
        close();
        return;
      }
      if (persistNew) await persistSuggestion(type, v);
      onChange([...value, v]);
      setDraft("");
      close();
    },
    [type, value, onChange, close]
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
      return;
    }

    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp") && trimmedDraft) {
      setOpen(true);
      setActiveIndex(0);
      e.preventDefault();
      return;
    }

    if (!open) {
      if (e.key === "Enter" && trimmedDraft) {
        e.preventDefault();
        void addMember(trimmedDraft, true);
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
        const s = suggestions[activeIndex];
        if (!hasMember(value, s)) void addMember(s, false);
        else {
          setDraft("");
          close();
        }
        return;
      }
      if (showAddNew && activeIndex === suggestions.length) {
        void addMember(trimmedDraft, true);
        return;
      }
      if (activeIndex < 0 && suggestions.length === 1 && !hasMember(value, suggestions[0])) {
        void addMember(suggestions[0], false);
        return;
      }
      if (activeIndex < 0 && trimmedDraft) {
        void addMember(trimmedDraft, true);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative space-y-2", className)}>
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap gap-1.5 rounded-md border border-input bg-background px-2 py-1.5",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <Badge
            key={`${tag}-${i}`}
            variant="secondary"
            className="gap-1 pr-1 font-normal"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remove ${tag}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(i);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          ref={inputRef}
          id={idProp}
          disabled={disabled}
          value={draft}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="min-w-[8rem] flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 h-8 px-1"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          role="combobox"
          autoComplete="off"
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (draft.trim()) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && trimmedDraft.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto"
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

          {suggestions.map((s, i) => {
            const taken = hasMember(value, s);
            return (
              <button
                key={`${s}-${i}`}
                type="button"
                role="option"
                disabled={taken}
                aria-selected={activeIndex === i}
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none",
                  activeIndex === i && "bg-accent text-accent-foreground"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!taken) void addMember(s, false);
                }}
              >
                <HighlightMatches text={s} query={draft} />
                {taken && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Added
                  </span>
                )}
              </button>
            );
          })}

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
              onClick={() => void addMember(trimmedDraft, true)}
            >
              Add new:{" "}
              <span className="text-foreground font-medium">
                {trimmedDraft}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
