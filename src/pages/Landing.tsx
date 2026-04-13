import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, FolderOpen, PenLine, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Search,
    title: "Search & Filter",
    description: "Instantly find projects by title, author, adviser, or keyword.",
  },
  {
    icon: FolderOpen,
    title: "Organized Records",
    description: "All capstone data structured, categorized, and easy to browse.",
  },
  {
    icon: PenLine,
    title: "Easy Data Input",
    description: "Import via CSV or add entries manually with a simple form.",
  },
  {
    icon: SlidersHorizontal,
    title: "Sort & Manage",
    description: "Sort by date, adviser, or title. Export anytime you need.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        {/* Subtle radial gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--muted)/0.45)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-px h-14 bg-border mx-auto origin-top"
          />

          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Capstone Catalog
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground/80 leading-relaxed max-w-md mx-auto">
              A quiet place for academic capstone records.
              <br />
              Search, browse, and manage — all in one view.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <Button
              onClick={() => navigate("/catalog")}
              className="h-12 px-8 text-sm gap-2 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              Open Catalog
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Dashboard preview mockup */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="pt-6"
          >
            <div className="mx-auto max-w-lg rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/40">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-catalog-gold/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-catalog-emerald/50" />
                <span className="ml-3 text-[10px] text-muted-foreground/50 font-sans tracking-wide">
                  capstone-catalog
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div
                        className="h-2.5 rounded-full bg-foreground/10"
                        style={{ width: `${70 - i * 12}%` }}
                      />
                      <div
                        className="h-2 rounded-full bg-foreground/5"
                        style={{ width: `${50 - i * 8}%` }}
                      />
                    </div>
                    <div className="w-14 h-5 rounded-md bg-accent/10" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-12 h-px bg-border mx-auto" />

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.p
            className="text-center text-xs font-sans uppercase tracking-widest text-muted-foreground/60 mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What you can do
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="group rounded-xl border border-border/50 bg-card/50 p-5 hover:border-accent/30 hover:shadow-md transition-all duration-300"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-accent/10 transition-colors">
                  <feat.icon className="w-4.5 h-4.5 text-primary/70 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-serif text-sm font-semibold text-foreground mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 mt-auto">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
          <div className="w-8 h-px bg-border" />
          <p className="text-[11px] text-muted-foreground/50 tracking-wide uppercase font-sans">
            Information Technology · Capstone Records
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
