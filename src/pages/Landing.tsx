import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-16 text-center">
        {/* Mark */}
        <div className="space-y-6">
          <div className="w-px h-16 bg-border mx-auto" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Capstone Catalog
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A quiet place for academic capstone records.
            <br />
            Search, browse, and manage — all in one view.
          </p>
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          onClick={() => navigate("/catalog")}
          className="h-11 px-6 text-sm gap-2 mx-auto border-border hover:border-foreground hover:bg-transparent transition-colors duration-300"
        >
          Open Catalog
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Footer */}
        <p className="text-[11px] text-muted-foreground/60 tracking-wide uppercase">
          Information Technology · Capstone Records
        </p>
      </div>
    </div>
  );
};

export default Landing;
