import { useState, useMemo, useRef, useEffect } from "react";
import { CapstoneProject, SortField, SortDirection } from "@/types/capstone";
import { fetchProjects, addProject as addProjectToDb, addProjectsBatch } from "@/lib/firestore";
import AddProjectDialog from "@/components/AddProjectDialog";
import ProjectDetailDialog from "@/components/ProjectDetailDialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, GraduationCap, Download, Upload, BookOpen, ChevronUp, ChevronDown, ExternalLink, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { parseCSVLine, parseTSVLine, stripCsvBom, escapeCsvField } from "@/lib/csv";
import { normalizeDriveLink } from "@/lib/driveLink";

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEMS_PER_PAGE = 10;

const normalizeHeaderKey = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

const monthFromValue = (raw: string): number => {
  const s = (raw || "").trim();
  if (!s) return 1;
  const n = parseInt(s, 10);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return n;
  const idx = monthNames.findIndex((m) => m.toLowerCase() === s.toLowerCase());
  return idx > 0 ? idx : 1;
};

const splitPeople = (raw: string): string[] => {
  const s = (raw || "").trim();
  if (!s) return [];

  // Prefer semicolon delimiter (our exporter uses it)
  const semi = s.split(";").map((x) => x.trim()).filter(Boolean);
  if (semi.length > 1) return semi;

  // Fall back to comma delimiter, but try to keep suffixes like "MIT", "DIT", etc attached
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  const merged: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const cur = parts[i];
    const next = parts[i + 1];
    if (next && /^[A-Z]{2,6}\.?$/.test(next)) {
      merged.push(`${cur}, ${next}`);
      i++;
    } else {
      merged.push(cur);
    }
  }
  return merged.length ? merged : [s];
};

const Index = () => {
  const [projects, setProjects] = useState<CapstoneProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then((data) => setProjects(data))
      .catch(() => toast.error("Failed to load projects from database."))
      .finally(() => setLoading(false));
  }, []);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [selectedProject, setSelectedProject] = useState<CapstoneProject | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 ml-1" />
      : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = projects.filter(p => {
      if (!q) return true;
      switch (searchCategory) {
        case "title": return p.title.toLowerCase().includes(q);
        case "author": return p.authors.some(a => a.toLowerCase().includes(q));
        case "adviser": return p.adviser.toLowerCase().includes(q);
        case "coordinator": return p.thesisCoordinator.toLowerCase().includes(q);
        case "panel": return p.panelMembers.some(m => m.toLowerCase().includes(q));
        case "keyword": {
          const words = q.split(/\s+/).filter(Boolean);
          return (p.keywords || []).some(k => {
            const kLower = k.toLowerCase();
            return words.every(w => kLower.includes(w));
          });
        }
        default:
          return (
            p.title.toLowerCase().includes(q) ||
            p.authors.some(a => a.toLowerCase().includes(q)) ||
            p.adviser.toLowerCase().includes(q) ||
            p.thesisCoordinator.toLowerCase().includes(q) ||
            p.panelMembers.some(m => m.toLowerCase().includes(q)) ||
            (p.keywords || []).some(k => k.toLowerCase().includes(q))
          );
      }
    });

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "author": cmp = a.authors[0].localeCompare(b.authors[0]); break;
        case "adviser": cmp = a.adviser.localeCompare(b.adviser); break;
        case "date": cmp = a.year * 100 + a.month - (b.year * 100 + b.month); break;
        case "coordinator": cmp = a.thesisCoordinator.localeCompare(b.thesisCoordinator); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [projects, search, searchCategory, sortField, sortDir]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, searchCategory, sortField, sortDir, projects.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAdd = async (project: CapstoneProject) => {
    try {
      const { id, ...data } = project;
      const newId = await addProjectToDb(data);
      setProjects(prev => [{ ...project, id: newId }, ...prev]);
    } catch (err) {
      console.error("Failed to add project:", err);
      toast.error("Failed to save project to database.");
    }
  };

  const handleRowClick = (project: CapstoneProject) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const exportCSV = () => {
    const headers = ["Title", "Authors", "Adviser", "Panel Members", "Month", "Year", "Thesis Coordinator", "Keywords", "Drive Link"];
    const rows = filtered.map(p => [
      escapeCsvField(p.title),
      escapeCsvField(p.authors.join("; ")),
      escapeCsvField(p.adviser),
      escapeCsvField(p.panelMembers.join("; ")),
      monthNames[p.month],
      p.year,
      escapeCsvField(p.thesisCoordinator),
      escapeCsvField((p.keywords || []).join("; ")),
      escapeCsvField(p.driveLink || ""),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "capstone_projects.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully!");
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const raw = event.target?.result as string;
      const text = stripCsvBom(raw);
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV file is empty or invalid.");
        return;
      }

      const delimiter: "csv" | "tsv" =
        (lines[0].match(/\t/g)?.length || 0) > (lines[0].match(/,/g)?.length || 0) ? "tsv" : "csv";
      const parseLine = delimiter === "tsv" ? parseTSVLine : parseCSVLine;

      const headerCols = parseLine(lines[0]).map(normalizeHeaderKey);
      const colIndex = (name: string) => headerCols.indexOf(normalizeHeaderKey(name));
      const getFromRow = (cols: string[], name: string) => {
        const idx = colIndex(name);
        return idx >= 0 ? String(cols[idx] ?? "").trim() : "";
      };

      const newProjects: CapstoneProject[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        if (cols.length < 2) continue;

        // Flexible header mapping: supports both our exported CSV and your TSV format
        const title = getFromRow(cols, "title");
        if (!title) continue;

        const authorsRaw = getFromRow(cols, "authors") || getFromRow(cols, "author");
        const panelRaw =
          getFromRow(cols, "panelMembers") || getFromRow(cols, "panel") || getFromRow(cols, "panelmembers");
        const adviser = getFromRow(cols, "adviser");
        const yearRaw = getFromRow(cols, "year");
        const monthRaw = getFromRow(cols, "month");
        const coordinator = getFromRow(cols, "thesisCoordinator") || getFromRow(cols, "coordinator");
        const keywordsRaw = getFromRow(cols, "keyword") || getFromRow(cols, "keywords");
        const driveRaw = getFromRow(cols, "driveLink") || getFromRow(cols, "drive");

        const parsedYear = parseInt(yearRaw, 10);
        const parsedKeywords = keywordsRaw.split(";").map((k) => k.trim()).filter(Boolean);

        newProjects.push({
          id: crypto.randomUUID(),
          title,
          authors: splitPeople(authorsRaw),
          panelMembers: splitPeople(panelRaw),
          adviser,
          year: Number.isFinite(parsedYear) && parsedYear > 1900 ? parsedYear : new Date().getFullYear(),
          month: monthFromValue(monthRaw),
          thesisCoordinator: coordinator,
          keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
          driveLink: normalizeDriveLink(driveRaw),
        });
      }
      if (newProjects.length > 0) {
        const existingKeys = new Set(
          projects.map((p) => `${p.title.toLowerCase()}|${p.authors.map(a => a.toLowerCase()).sort().join(";")}`)
        );
        const unique = newProjects.filter(
          (p) => !existingKeys.has(`${p.title.toLowerCase()}|${p.authors.map(a => a.toLowerCase()).sort().join(";")}`)
        );
        const skipped = newProjects.length - unique.length;
        if (skipped > 0) {
          toast.info(`Skipped ${skipped} duplicate(s).`);
        }
        if (unique.length === 0) {
          toast.info("All projects already exist. No new records imported.");
        } else {
          try {
            const ids = await addProjectsBatch(unique.map(({ id, ...rest }) => rest));
            const saved = unique.map((p, i) => ({ ...p, id: ids[i] }));
            setProjects(prev => [...saved, ...prev]);
            toast.success(`Imported ${unique.length} new project(s)!`);
          } catch (err) {
            console.error("Failed to import projects:", err);
            toast.error("Failed to save imported projects to database.");
          }
        }
      } else {
        toast.error("No valid projects found in CSV.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero / Header */}
      <header className="border-b border-border/60 bg-card">
        <div className="container max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-2">
          <GraduationCap className="text-accent shrink-0 h-[36px] w-[36px]" />
          <h1 className="font-serif font-bold text-foreground tracking-tight text-3xl sm:text-2xl">
            Capstone Catalog
          </h1>
        </div>
        <div className="container max-w-6xl px-4 sm:px-6 pb-3">
          <p className="text-muted-foreground font-sans text-sm max-w-lg pl-[44px]">
            Browse, search, and manage academic capstone project records in one place.
          </p>
        </div>
      </header>

      {/* Search + Actions */}
      <div className="container max-w-6xl px-4 sm:px-6 py-4 sm:py-6 pb-8">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 w-full">
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger className="w-[140px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="adviser">Adviser</SelectItem>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="panel">Panel Member</SelectItem>
                <SelectItem value="keyword">Keyword</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center">
            <AddProjectDialog onAdd={handleAdd} triggerClassName="w-full sm:w-auto justify-center" />

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:gap-2 sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="gap-1.5 text-xs sm:text-sm w-full sm:w-auto justify-center"
              >
                <Download className="w-4 h-4" /> Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs sm:text-sm w-full sm:w-auto justify-center"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground justify-center"
                    aria-label="CSV import help"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm" align="start">
                <h4 className="font-semibold mb-2">CSV Import Format</h4>
                <p className="text-muted-foreground text-xs mb-2">
                  The CSV file must include a header row. Supported columns:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4 mb-3">
                  <li><span className="font-medium text-foreground">Title</span> — required</li>
                  <li><span className="font-medium text-foreground">Authors</span> — semicolon-separated</li>
                  <li><span className="font-medium text-foreground">Adviser</span></li>
                  <li><span className="font-medium text-foreground">Panel Members</span> — semicolon-separated</li>
                  <li><span className="font-medium text-foreground">Month</span> — name or number (1–12)</li>
                  <li><span className="font-medium text-foreground">Year</span></li>
                  <li><span className="font-medium text-foreground">Thesis Coordinator</span></li>
                  <li><span className="font-medium text-foreground">Keywords</span> — semicolon-separated</li>
                  <li><span className="font-medium text-foreground">Drive Link</span> — Google Drive URL</li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => {
                    const headers = ["Title", "Authors", "Adviser", "Panel Members", "Month", "Year", "Thesis Coordinator", "Keywords", "Drive Link"];
                    const sample = ["Sample Capstone Project", "Author One; Author Two", "Dr. Adviser", "Panel A; Panel B", "6", "2025", "Dr. Coordinator", "AI; Machine Learning", ""];

                    const csv = [
                      headers.join(","),
                      sample.map((v) => escapeCsvField(v)).join(","),
                    ].join("\n");

                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "capstone_template.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-3 h-3" /> Download Template (.csv)
                </Button>
                </PopoverContent>
              </Popover>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={importCSV} />
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="container max-w-6xl px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
            <p className="font-serif text-lg">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-serif text-lg">No projects found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new project</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border/60 bg-card overflow-x-auto">
              <Table className="min-w-[500px] sm:min-w-0">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                      <span className="flex items-center">Title <SortIcon field="title" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("author")}>
                      <span className="flex items-center">Authors <SortIcon field="author" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort("adviser")}>
                      <span className="flex items-center">Adviser <SortIcon field="adviser" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort("coordinator")}>
                      <span className="flex items-center">Coordinator <SortIcon field="coordinator" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("date")}>
                      <span className="flex items-center justify-end">Date <SortIcon field="date" /></span>
                    </TableHead>
                    <TableHead className="text-center w-[60px]">Drive</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((project, index) => {
                    const driveUrl = normalizeDriveLink(project.driveLink);
                    const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    return (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(project)}
                    >
                      <TableCell className="text-center text-muted-foreground">{rowNumber}</TableCell>
                      <TableCell className="font-medium max-w-[280px]">
                        <span className="line-clamp-2">{project.title}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px]">
                        <span className="line-clamp-1">{project.authors.join(", ")}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {project.adviser}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {project.thesisCoordinator}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                        {monthNames[project.month].slice(0, 3)} {project.year}
                      </TableCell>
                      <TableCell className="text-center">
                        {driveUrl ? (
                          <a
                            href={driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent/10 text-accent transition-colors"
                            title="Open Drive folder (Abstract, Approval Sheet, Book Cover)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (() => {
              const pages: (number | "...")[] = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, "...", currentPage, "...", totalPages);
              }
              return (
                <div className="flex items-center justify-between px-4 py-3 mt-2 mb-4 text-sm">
                  <span className="text-xs text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {pages.map((page, idx) =>
                      page === "..." ? (
                        <span key={`e${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                      ) : (
                        <Button key={page} variant={page === currentPage ? "default" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => setCurrentPage(page as number)}>
                          {page}
                        </Button>
                      )
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      <ProjectDetailDialog
        project={selectedProject}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <footer className="border-t border-border/60 bg-card mt-auto">
        <div className="container max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Capstone Catalog. All rights reserved.</span>
          <span>Information Technology Capstone Records</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
