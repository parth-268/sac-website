import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  type Transition,
} from "framer-motion";
import { useActiveHeroBanners } from "@/hooks/useHeroBanners";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

/* -------------------------------------------------------------------------- */
/*                               Motion Config                                 */
/* -------------------------------------------------------------------------- */

const FADE_SMOOTH: Transition = {
  duration: 0.8,
  ease: "easeOut",
};

const FADE_SLOW: Transition = {
  duration: 2,
  ease: "easeInOut",
};

const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 26,
  mass: 0.9,
};

/* -------------------------------------------------------------------------- */
/*                                    Hero                                    */
/* -------------------------------------------------------------------------- */

export const Hero = () => {
  const containerRef = useRef<HTMLElement | null>(null);

  /* ------------------------------ Data Fetch ------------------------------ */
  const { data: dbBanners, isLoading } = useActiveHeroBanners();
  const { data: settings } = useSiteSettings();

  const getText = (key: string, fallback: string) =>
    settings?.find((s) => s.setting_key === key)?.setting_value || fallback;

  const line1 = getText("hero_line_1", "Students'");
  const line2 = getText("hero_line_2", "Affairs");
  const line3 = getText("hero_line_3", "Council");
  const description = getText(
    "hero_description",
    "The apex body representing the student voice, fostering leadership, and building a vibrant campus culture.",
  );
  const ctaText = getText("hero_cta_text", "Explore SAC");
  const ctaLink = getText("hero_cta_link", "#about");

  const banners =
    dbBanners && dbBanners.length > 0
      ? dbBanners
      : [
          {
            id: "default",
            image_url:
              "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop",
          },
        ];

  /* ------------------------------ Carousel ------------------------------ */
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(
      () => setCurrentSlide((p) => (p + 1) % banners.length),
      6500,
    );
    return () => clearInterval(timer);
  }, [banners.length]);

  /* ------------------------------ Parallax ------------------------------ */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  if (isLoading) {
    return <Skeleton className="h-screen w-full bg-[#0a0f1d]" />;
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f1d] selection:bg-accent/30"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Background Carousel                                                */}
      {/* ------------------------------------------------------------------ */}
      <motion.div style={{ y: yBackground }} className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={banners[currentSlide].id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_SLOW}
            className="absolute inset-0"
          >
            <img
              src={banners[currentSlide].image_url}
              alt="IIM Sambalpur Campus"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />

            {/* Layered cinematic overlays */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Foreground Content                                                  */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        style={{ y: yContent, opacity: opacityContent }}
        className="relative z-10 container-wide mx-auto px-4 sm:px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FADE_SMOOTH}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#eab308]" />
          <span className="text-white/90 text-[10px] uppercase tracking-widest font-bold">
            IIM Sambalpur • Est. 2015
          </span>
        </motion.div>

        {/* Heading */}
        <h1 className="font-heading font-bold tracking-tight leading-[0.9] mb-6 flex flex-col items-center">
          {[line1, line2, line3].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SOFT, delay: i * 0.12 }}
              className={`block w-full text-center text-[16vw] sm:text-6xl md:text-7xl lg:text-8xl ${
                i === 2
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500"
                  : i === 1
                    ? "text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70"
                    : "text-white"
              }`}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...FADE_SMOOTH, delay: 0.45 }}
          className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...FADE_SMOOTH, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="xl"
            asChild
            className="h-12 px-10 rounded-full bg-white text-black hover:bg-accent hover:text-white font-bold transition-all duration-300"
          >
            <a href={ctaLink}>{ctaText}</a>
          </Button>

          <a
            href="#events"
            className="group flex items-center gap-2 text-white/80 hover:text-accent transition-colors"
          >
            <span className="text-xs uppercase tracking-widest font-bold">
              Upcoming Events
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Scroll Indicator                                                    */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50 pointer-events-none"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};
