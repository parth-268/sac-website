import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface PageHeroProps {
  title: string;
  highlight?: string;
  description: string;
  className?: string;
  pattern?: "dots" | "grid" | "waves";
  variant?: "centered" | "editorial";
}

export const PageHero = ({
  title,
  highlight,
  description,
  className,
  pattern = "dots",
  variant = "editorial",
}: PageHeroProps) => {
  const { data: settings } = useSiteSettings();
  const getVal = React.useCallback(
    (key: string, fallback: string) =>
      settings?.find((s) => s.setting_key === key)?.setting_value || fallback,
    [settings],
  );

  const sacLogoUrl = React.useMemo(() => getVal("sac_logo_url", ""), [getVal]);

  const collegeLogoUrl = React.useMemo(
    () => getVal("college_logo_url", ""),
    [getVal],
  );

  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className={cn(
        "relative pt-28 pb-14 md:pt-36 md:pb-20 lg:pb-24 bg-primary text-primary-foreground overflow-hidden isolate",
        className,
      )}
    >
      {/* SAC Logo Watermark */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none flex items-end justify-center opacity-[0.15] select-none"
      >
        <div className="flex items-center gap-10 min-h-[100px]">
          {sacLogoUrl && (
            <img
              src={sacLogoUrl}
              alt=""
              className="w-[180px] md:w-[220px] lg:w-[260px]"
              loading="eager"
              decoding="async"
            />
          )}
        </div>
      </div>

      {/* --- PATTERNS --- */}
      <div className="absolute inset-0 pointer-events-none will-change-transform">
        {/* GRID PATTERN: Increased opacity and size for better visibility */}
        {pattern === "grid" && (
          <div
            className="absolute inset-0 opacity-15 md:opacity-20"
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
            className="absolute inset-0 opacity-15 md:opacity-20"
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
            className="absolute inset-0 opacity-10 md:opacity-15"
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
      <div
        className={cn(
          "container-wide mx-auto px-4 relative z-10",
          variant === "centered" && "text-center",
        )}
      >
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className={cn(
            variant === "centered" && "max-w-3xl mx-auto",
            variant === "editorial" &&
              "max-w-2xl md:max-w-3xl md:ml-0 text-left",
          )}
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight leading-[1.05]">
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
                    strokeWidth="2.5"
                    fill="none"
                  />
                </svg>
              </span>
            )}
          </h1>

          <p
            className={cn(
              "text-sm md:text-lg text-white/70 font-light leading-relaxed",
              variant === "centered" && "max-w-xl mx-auto",
              variant === "editorial" && "max-w-lg",
            )}
          >
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
