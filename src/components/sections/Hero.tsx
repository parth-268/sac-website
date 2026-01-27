import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useActiveHeroBanners } from "@/hooks/useHeroBanners";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

export const Hero = () => {
  const containerRef = useRef(null);

  // 1. Fetch Dynamic Data
  const { data: dbBanners, isLoading: loadingBanners } = useActiveHeroBanners();
  const { data: settings } = useSiteSettings();

  // 2. Helper to get Text from DB
  const getText = (key: string, fallback: string) =>
    settings?.find((s) => s.setting_key === key)?.setting_value || fallback;

  // 3. Fallback Content (The look you liked)
  const line1 = getText("hero_line_1", "Students'");
  const line2 = getText("hero_line_2", "Affairs");
  const line3 = getText("hero_line_3", "Council");
  const description = getText(
    "hero_description",
    "The apex body representing the student voice, fostering leadership, and building a vibrant community.",
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

  const [currentSlide, setCurrentSlide] = useState(0);

  // --- Scroll Parallax Logic (From Reference) ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // --- Carousel Auto-Play ---
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(
      () => setCurrentSlide((p) => (p + 1) % banners.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loadingBanners)
    return <Skeleton className="h-screen w-full bg-[#0a0f1d]" />;

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-[#0a0f1d] selection:bg-accent/30"
    >
      {/* --- LAYER 1: IMMERSIVE CAROUSEL BACKGROUND --- */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={banners[currentSlide].id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }} // Slow, cinematic fade
            className="absolute inset-0"
          >
            <img
              src={banners[currentSlide].image_url}
              alt="Campus"
              className="w-full h-[120%] object-cover object-center filter brightness-[0.85] contrast-110"
            />
            {/* Global Darkening for mood */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Spotlight Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
            {/* Grain Texture */}
            <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* --- LAYER 2: CENTRAL CONTENT (STATIC & DYNAMIC) --- */}
      <motion.div
        style={{ y: yText, opacity: opacityText }}
        className="container-wide mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center max-w-6xl"
      >
        {/* Animated Badge (Static Branding) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 mb-6 md:mb-10 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl group cursor-default hover:bg-white/10 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-white/90 font-bold tracking-[0.25em] text-[10px] sm:text-xs uppercase group-hover:text-white transition-colors">
            IIM Sambalpur • Est. 2015
          </span>
        </motion.div>

        {/* Hero Headline - Maximized Typography (Split into 3 lines from DB) */}
        <h1 className="font-heading font-bold text-white leading-[0.85] tracking-tight mb-8 drop-shadow-2xl flex flex-col items-center w-full">
          {/* Line 1: Standard White */}
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-[15vw] md:text-8xl lg:text-9xl block w-full text-center"
          >
            {line1}
          </motion.span>

          {/* Line 2: Gradient White Fade */}
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[15vw] md:text-8xl lg:text-9xl block w-full text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70"
          >
            {line2}
          </motion.span>

          {/* Line 3: Accent Gradient */}
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[15vw] md:text-8xl lg:text-9xl block w-full text-center text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500 pb-2"
          >
            {line3}
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-2xl text-white/80 mb-12 leading-relaxed max-w-3xl font-light tracking-wide mix-blend-screen px-4"
        >
          {description}
        </motion.p>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full sm:w-auto"
        >
          <Button
            size="xl"
            className="h-12 px-10 rounded-full bg-white text-black hover:bg-accent hover:text-white font-bold text-base shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <a href={ctaLink}>{ctaText}</a>
          </Button>

          <a
            href="#events"
            className="group flex items-center gap-2 text-white/80 font-medium hover:text-accent transition-colors"
          >
            <span className="uppercase tracking-widest text-xs font-bold">
              Upcoming Events
            </span>
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-accent/50 transition-all">
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 text-white/50"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};
