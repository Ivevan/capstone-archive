import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, FolderOpen, PenLine, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Search, title: "Search & Filter" },
  { icon: FolderOpen, title: "Organized Records" },
  { icon: PenLine, title: "Easy Data Input" },
  { icon: SlidersHorizontal, title: "Sort & Manage" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row">
      {/* Left – white side */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 bg-white dark:bg-background relative">
        <motion.div
          className="max-w-sm w-full space-y-6 text-center md:text-left"
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="w-px h-10 bg-border mx-auto md:mx-0 mb-6" />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Capstone
              <br />
              Catalog
            </h1>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            A quiet place for academic capstone records.
            <br className="hidden sm:block" />
            Search, browse, and manage — all in one view.
          </motion.p>

          <motion.div variants={fadeUp} custom={2}>
            <Button
              onClick={() => navigate("/catalog")}
              className="h-11 px-7 text-sm gap-2 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              Open Catalog
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-wrap gap-2 justify-center md:justify-start pt-2"
          >
            {features.map((f) => (
              <span
                key={f.title}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground"
              >
                <f.icon className="w-3 h-3" />
                {f.title}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <p className="absolute bottom-4 text-[10px] text-muted-foreground/40 uppercase tracking-widest font-sans">
          Information Technology · Capstone Records
        </p>
      </div>

      {/* Right – themed side */}
      <div className="flex-1 flex items-center justify-center bg-primary relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary-foreground))_0%,transparent_60%)]" />

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-[85%] max-w-xs sm:max-w-sm"
        >
          <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/10 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-primary-foreground/10">
              <span className="w-2 h-2 rounded-full bg-destructive/60" />
              <span className="w-2 h-2 rounded-full bg-catalog-gold/60" />
              <span className="w-2 h-2 rounded-full bg-catalog-emerald/60" />
              <span className="ml-2 text-[9px] text-primary-foreground/40 font-sans tracking-wide">
                capstone-catalog
              </span>
            </div>
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg bg-primary-foreground/5 px-3 py-2"
                >
                  <div className="w-6 h-6 rounded bg-primary-foreground/10 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div
                      className="h-2 rounded-full bg-primary-foreground/15"
                      style={{ width: `${75 - i * 12}%` }}
                    />
                    <div
                      className="h-1.5 rounded-full bg-primary-foreground/8"
                      style={{ width: `${55 - i * 8}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
