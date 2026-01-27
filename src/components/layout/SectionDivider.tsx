import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "line" | "fade" | "none";
  className?: string;
}

export const SectionDivider = ({
  variant = "line",
  className,
}: SectionDividerProps) => {
  if (variant === "none")
    return <div className={cn("h-12 md:h-24", className)} />;

  if (variant === "fade") {
    return (
      <div
        className={cn(
          "w-full h-24 md:h-32 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none -mt-24 relative z-10",
          className,
        )}
      />
    );
  }

  // Default "line" variant - sleek and modern
  return (
    <div className={cn("relative py-1 md:py-1", className)}>
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-100 border border-slate-200 -mt-1" />
    </div>
  );
};
