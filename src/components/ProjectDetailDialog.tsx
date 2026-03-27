import { CapstoneProject } from "@/types/capstone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, Users, BookOpen, GraduationCap, ExternalLink } from "lucide-react";

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ProjectDetailDialogProps {
  project: CapstoneProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailDialog = ({ project, open, onOpenChange }: ProjectDetailDialogProps) => {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl leading-snug pr-6">
            {project.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Badge variant="secondary" className="text-xs font-sans">
            <CalendarDays className="w-3 h-3 mr-1" />
            {monthNames[project.month]} {project.year}
          </Badge>

          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 mt-0.5 text-accent shrink-0" />
            <div>
              <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Authors</span>
              <p className="text-foreground text-sm">{project.authors.join(", ")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="w-4 h-4 mt-0.5 text-catalog-emerald shrink-0" />
            <div>
              <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Adviser</span>
              <p className="text-foreground text-sm">{project.adviser}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 mt-0.5 text-catalog-gold shrink-0" />
            <div>
              <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Panel Members</span>
              <p className="text-foreground text-sm">{project.panelMembers.join(", ")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Thesis Coordinator</span>
              <p className="text-foreground text-sm">{project.thesisCoordinator}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailDialog;
