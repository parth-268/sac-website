import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  highlight?: string;
  description: string;
  className?: string;
  pattern?: "dots" | "grid" | "waves";
}

export const PageHero = ({
  title,
  highlight,
  description,
  className,
  pattern = "grid",
}: PageHeroProps) => {
  return (
    <section
      className={cn(
        "relative pt-28 pb-14 md:pt-36 md:pb-20 bg-primary text-primary-foreground overflow-hidden",
        className,
      )}
    >
      {/* --- PATTERNS --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* GRID PATTERN: Increased opacity and size for better visibility */}
        {pattern === "grid" && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), 
                                linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        )}

        {/* DOTS PATTERN */}
        {pattern === "dots" && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          />
        )}

        {/* WAVES PATTERN (Added) */}
        {pattern === "waves" && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 10px,
                        rgba(255, 255, 255, 0.1) 10px,
                        rgba(255, 255, 255, 0.1) 20px
                    )`,
            }}
          />
        )}
      </div>

      {/* Ambient Gradient Glow (Top Left) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="container-wide mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
            {title}{" "}
            {highlight && (
              <span className="text-accent relative inline-block">
                {highlight}
                {/* Optional: Subtle Underline Decoration */}
                <svg
                  className="absolute w-full h-2 -bottom-0 left-0 text-accent opacity-40"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
            )}
          </h1>
          <p className="text-sm md:text-lg text-white/70 font-light leading-relaxed max-w-xl mx-auto">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
