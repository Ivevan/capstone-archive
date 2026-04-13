import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, BookOpen, Users, Calendar, Tag } from "lucide-react";

const features = [
  { icon: Search, label: "Search & Filter", desc: "Find projects by title, author, adviser, and more" },
  { icon: Users, label: "Team Records", desc: "Track authors, panel members, and coordinators" },
  { icon: Calendar, label: "Date Sorting", desc: "Sort by month and year of submission" },
  { icon: Tag, label: "Keywords", desc: "Organize projects with searchable tags" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="container max-w-3xl text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-4 rounded-2xl bg-accent/10">
              <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-accent" />
            </div>
          </div>
          
          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground">
            Capstone Catalog
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Browse, search, and manage academic capstone project records in one place
          </p>

          {/* Demo Search Bar */}
          <div className="relative max-w-lg mx-auto pt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="h-12 pl-12 pr-4 text-base border-2 border-border/60 focus:border-accent"
            />
          </div>

          {/* Primary CTA */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/catalog")}
              className="h-12 px-8 text-base gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Enter Catalog
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/60 bg-card/50">
        <div className="container max-w-4xl px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-lg bg-background/50"
              >
                <div className="p-2 rounded-md bg-accent/10 shrink-0">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card">
        <div className="container max-w-4xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Capstone Catalog. All rights reserved.</span>
          <span>Information Technology Capstone Records</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;