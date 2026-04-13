import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, FolderOpen, PenLine, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Search, title: "Search & Filter", desc: "Find projects instantly" },
  { icon: FolderOpen, title: "Organized Records", desc: "Structured archive" },
  { icon: PenLine, title: "Easy Data Input", desc: "Quick entry workflow" },
  { icon: SlidersHorizontal, title: "Sort & Manage", desc: "Full control" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const slideIn = {
  hidden: { opacity: 0, x: 60, rotateY: -8 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { delay: 0.3, duration: 0.8, ease: "easeOut" as const },
  },
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row">
      {/* Left – hero side */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-14 py-10 relative bg-background">
        {/* Soft radial glow behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-md w-full space-y-8 text-center md:text-left"
          initial="hidden"
          animate="visible"
        >
          {/* Accent line */}
          <motion.div variants={fadeUp} custom={0}>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.4rem] font-bold leading-[1.1] tracking-tight text-foreground">
              <span className="text-primary">Capstone</span>
              <br />
              Catalog
            </h1>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-xs mx-auto md:mx-0"
          >
            A quiet place for academic capstone records.
            <br className="hidden sm:block" />
            Search, browse, and manage — all in one view.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} custom={2}>
            <Button
              onClick={() => navigate("/catalog")}
              className="h-12 px-8 text-sm font-medium gap-2.5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.04] active:scale-[0.97] transition-all duration-300 rounded-lg"
            >
              Open Catalog
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="grid grid-cols-2 gap-2.5 pt-2 max-w-sm mx-auto md:mx-0"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -2, scale: 1.02 }}
                className="group flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-3.5 py-2.5 cursor-default transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/[0.07] group-hover:bg-primary/[0.12] transition-colors duration-200">
                  <f.icon className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <span className="text-[11px] font-medium text-foreground/70 group-hover:text-foreground/90 transition-colors">
                  {f.title}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <p className="absolute bottom-5 text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-sans">
          Information Technology · Capstone Records
        </p>
      </div>

      {/* Right – themed side */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-primary relative overflow-hidden">
        {/* Layered glow effects */}
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary-foreground))_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary-foreground))_0%,transparent_40%)]" />

        {/* Dashboard mockup – larger, tilted, floating */}
        <motion.div
          variants={slideIn}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-[90%] max-w-sm sm:max-w-md"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.08] backdrop-blur-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
            style={{ transform: "rotateY(-4deg) rotateX(2deg)" }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-1.5 px-5 py-3 border-b border-primary-foreground/10">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-catalog-gold/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-catalog-emerald/50" />
              <span className="ml-3 text-[10px] text-primary-foreground/40 font-sans tracking-wide">
                capstone-catalog
              </span>
            </div>

            {/* Search bar mockup */}
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/[0.06] border border-primary-foreground/[0.06] px-3 py-2">
                <Search className="w-3 h-3 text-primary-foreground/30" />
                <div className="h-2 rounded-full bg-primary-foreground/10 w-24" />
              </div>
            </div>

            {/* Rows */}
            <div className="p-4 space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-primary-foreground/[0.05] border border-primary-foreground/[0.04] px-3.5 py-2.5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary-foreground/[0.08] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div
                      className="h-2 rounded-full bg-primary-foreground/15"
                      style={{ width: `${80 - i * 10}%` }}
                    />
                    <div
                      className="h-1.5 rounded-full bg-primary-foreground/[0.07]"
                      style={{ width: `${60 - i * 7}%` }}
                    />
                  </div>
                  <div className="w-10 h-4 rounded-full bg-primary-foreground/[0.06]" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating accent card behind */}
          <div className="absolute -bottom-4 -left-4 w-32 h-20 rounded-xl bg-primary-foreground/[0.04] border border-primary-foreground/[0.06] backdrop-blur-sm -z-10" />
          <div className="absolute -top-3 -right-3 w-24 h-16 rounded-xl bg-primary-foreground/[0.03] border border-primary-foreground/[0.05] backdrop-blur-sm -z-10" />
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
