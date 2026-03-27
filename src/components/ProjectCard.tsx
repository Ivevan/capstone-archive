import { CapstoneProject } from "@/types/capstone";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, User, Users, BookOpen } from "lucide-react";

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ProjectCardProps {
  project: CapstoneProject;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <Card
      className="group animate-fade-in border-border/60 hover:border-accent/40 hover:shadow-lg transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 text-xs font-sans">
            <CalendarDays className="w-3 h-3 mr-1" />
            {monthNames[project.month]} {project.year}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 mt-0.5 text-accent shrink-0" />
          <div>
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Authors</span>
            <p className="text-foreground">{project.authors.join(", ")}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="w-4 h-4 mt-0.5 text-catalog-emerald shrink-0" />
          <div>
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Adviser</span>
            <p className="text-foreground">{project.adviser}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 mt-0.5 text-catalog-gold shrink-0" />
          <div>
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Panel</span>
            <p className="text-foreground">{project.panelMembers.join(", ")}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <span className="text-muted-foreground text-xs">
            Coordinator: <span className="text-foreground font-medium">{project.thesisCoordinator}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
