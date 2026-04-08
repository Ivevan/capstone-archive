import { useState } from "react";
import { CapstoneProject } from "@/types/capstone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface AddProjectDialogProps {
  onAdd: (project: CapstoneProject) => void;
  triggerClassName?: string;
}

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const AddProjectDialog = ({ onAdd, triggerClassName }: AddProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([""]);
  const [panelMembers, setPanelMembers] = useState<string[]>([""]);
  const [adviser, setAdviser] = useState("");
  const [keywords, setKeywords] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [driveLink, setDriveLink] = useState("");

  const addAuthor = () => {
    if (authors.length < 4) setAuthors([...authors, ""]);
  };

  const removeAuthor = (i: number) => {
    if (authors.length > 1) setAuthors(authors.filter((_, idx) => idx !== i));
  };

  const updateAuthor = (i: number, val: string) => {
    const copy = [...authors];
    copy[i] = val;
    setAuthors(copy);
  };

  const addPanel = () => setPanelMembers([...panelMembers, ""]);
  const removePanel = (i: number) => {
    if (panelMembers.length > 1) setPanelMembers(panelMembers.filter((_, idx) => idx !== i));
  };
  const updatePanel = (i: number, val: string) => {
    const copy = [...panelMembers];
    copy[i] = val;
    setPanelMembers(copy);
  };

  const reset = () => {
    setTitle(""); setAuthors([""]); setPanelMembers([""]); setAdviser("");
    setKeywords(""); setMonth(""); setYear(""); setCoordinator(""); setDriveLink("");
  };

  const handleSubmit = () => {
    const filteredAuthors = authors.filter(a => a.trim());
    const filteredPanel = panelMembers.filter(p => p.trim());

    if (!title.trim() || filteredAuthors.length === 0 || !adviser.trim() || !month || !year || !coordinator.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const parsedKeywords = keywords.split(",").map(k => k.trim()).filter(Boolean);

    const project: CapstoneProject = {
      id: crypto.randomUUID(),
      title: title.trim(),
      authors: filteredAuthors,
      panelMembers: filteredPanel,
      adviser: adviser.trim(),
      year: parseInt(year),
      month: parseInt(month),
      thesisCoordinator: coordinator.trim(),
      keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
      driveLink: driveLink.trim() || undefined,
    };

    onAdd(project);
    reset();
    setOpen(false);
    toast.success("Project added successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={["gap-2", triggerClassName].filter(Boolean).join(" ")}>
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-[calc(100%-2rem)] sm:w-full mx-auto max-h-[85vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">New Capstone Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Authors * <span className="text-muted-foreground font-normal">(1-4 members)</span></Label>
              {authors.length < 4 && (
                <Button type="button" variant="ghost" size="sm" onClick={addAuthor} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> Add
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {authors.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={a} onChange={e => updateAuthor(i, e.target.value)} placeholder={`Author ${i + 1}`} />
                  {authors.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAuthor(i)} className="shrink-0 h-10 w-10">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Adviser *</Label>
            <Input value={adviser} onChange={e => setAdviser(e.target.value)} placeholder="Adviser name" />
          </div>

          <div>
            <Label>Keywords <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
            <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. IoT, Machine Learning, Mobile App" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Panel Members</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addPanel} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {panelMembers.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={p} onChange={e => updatePanel(i, e.target.value)} placeholder={`Panel member ${i + 1}`} />
                  {panelMembers.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePanel(i)} className="shrink-0 h-10 w-10">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Month *</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year *</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Thesis Coordinator *</Label>
            <Input value={coordinator} onChange={e => setCoordinator(e.target.value)} placeholder="Coordinator name" />
          </div>

          <div>
            <Label>Google Drive Link <span className="text-muted-foreground font-normal">(Abstract)</span></Label>
            <Input value={driveLink} onChange={e => setDriveLink(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." />
          </div>

          <Button onClick={handleSubmit} className="w-full mt-2">
            Save Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
