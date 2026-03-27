import { useState, useMemo } from "react";
import { CapstoneProject, SortField, SortDirection } from "@/types/capstone";
import { sampleProjects } from "@/data/sampleProjects";
import ProjectCard from "@/components/ProjectCard";
import AddProjectDialog from "@/components/AddProjectDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, BookOpen, GraduationCap } from "lucide-react";

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Index = () => {
  const [projects, setProjects] = useState<CapstoneProject[]>(sampleProjects);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const toggleDir = () => setSortDir(d => (d === "asc" ? "desc" : "asc"));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.authors.some(a => a.toLowerCase().includes(q)) ||
      p.adviser.toLowerCase().includes(q) ||
      p.thesisCoordinator.toLowerCase().includes(q) ||
      p.panelMembers.some(m => m.toLowerCase().includes(q))
    );

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "author":
          cmp = a.authors[0].localeCompare(b.authors[0]);
          break;
        case "adviser":
          cmp = a.adviser.localeCompare(b.adviser);
          break;
        case "date":
          cmp = a.year * 100 + a.month - (b.year * 100 + b.month);
          break;
        case "coordinator":
          cmp = a.thesisCoordinator.localeCompare(b.thesisCoordinator);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [projects, search, sortField, sortDir]);

  const handleAdd = (project: CapstoneProject) => {
    setProjects(prev => [project, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card">
        <div className="container max-w-6xl py-8">
          <div className="flex items-center gap-3 mb-1">
            <GraduationCap className="w-8 h-8 text-accent" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Capstone Catalog
            </h1>
          </div>
          <p className="text-muted-foreground font-sans ml-11">
            Browse, organize, and manage academic capstone project records
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="container max-w-6xl py-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, adviser..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Select value={sortField} onValueChange={v => setSortField(v as SortField)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="author">Sort by Author</SelectItem>
                <SelectItem value="adviser">Sort by Adviser</SelectItem>
                <SelectItem value="coordinator">Sort by Coordinator</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={toggleDir} title={sortDir === "asc" ? "Ascending" : "Descending"}>
              <ArrowUpDown className="w-4 h-4" />
            </Button>
            <AddProjectDialog onAdd={handleAdd} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Project Grid */}
      <div className="container max-w-6xl pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-serif text-lg">No projects found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new project</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
