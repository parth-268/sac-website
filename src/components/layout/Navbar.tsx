import { useState, useEffect } from "react";
import { Menu, X, Settings, ChevronRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/* -------------------------------------------------------------------------- */
/*                               Motion Config                                 */
/* -------------------------------------------------------------------------- */

const NAV_FADE: Transition = {
  duration: 0.35,
  ease: "easeOut",
};

const MENU_SLIDE: Transition = {
  duration: 0.4,
  ease: "easeInOut",
};

/* -------------------------------------------------------------------------- */
/*                                   Config                                    */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Clubs", href: "/clubs" },
  { name: "Committees", href: "/committees" },
  { name: "Events", href: "/events" },
  { name: "Alumni", href: "/alumni" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isEditor } = useAuth();
  const location = useLocation();

  const { data: settings } = useSiteSettings();
  const sacLogoUrl = settings?.find(
    (s) => s.setting_key === "sac_logo_url",
  )?.setting_value;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  /* ------------------------------------------------------------------------ */
  /*                               VISUAL LOGIC                                */
  /* ------------------------------------------------------------------------ */

  // Clear, decisive backgrounds
  const navBg = scrolled
    ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
    : "bg-[#0b1220]/60 backdrop-blur-xl border-b border-white/10";

  const primaryText = scrolled ? "text-slate-900" : "text-white";
  const secondaryText = scrolled ? "text-slate-500" : "text-white/70";

  return (
    <>
      {/* ============================ NAVBAR ============================ */}
      <motion.nav
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={NAV_FADE}
        className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-colors duration-300",
          navBg,
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          {/* ------------------------ LEFT: Logo ------------------------ */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative flex items-center justify-center">
              {sacLogoUrl ? (
                <img
                  src={sacLogoUrl}
                  alt="SAC Logo"
                  className={cn(
                    "h-11 w-auto object-contain transition-opacity duration-300",
                    scrolled ? "opacity-100" : "opacity-80",
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center font-bold transition-opacity duration-300",
                    scrolled
                      ? "bg-accent text-black"
                      : "bg-white/20 text-white",
                  )}
                >
                  S
                </div>
              )}
            </div>

            <div className="flex flex-col leading-none">
              <span
                className={cn("font-heading font-bold text-sm", primaryText)}
              >
                Students' Affairs Council
              </span>
              <span
                className={cn(
                  "text-[9px] tracking-widest uppercase font-medium mt-0.5",
                  secondaryText,
                )}
              >
                IIM Sambalpur
              </span>
            </div>
          </Link>

          {/* --------------------- CENTER: Links ---------------------- */}
          <div className="hidden md:flex items-center gap-1 ml-auto mr-6">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all",
                    active
                      ? "text-accent bg-accent/10"
                      : scrolled
                        ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        : "text-white/80 hover:text-white hover:bg-white/10",
                  )}
                >
                  {link.name}
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-accent/10 ring-1 ring-accent/40" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* --------------------- RIGHT: Auth ----------------------- */}
          <div className="hidden md:flex items-center gap-4 pl-6 border-l border-slate-200/60">
            {user ? (
              isEditor && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="rounded-full border-accent/40 text-accent hover:bg-accent hover:text-black"
                >
                  <Link to="/admin">
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                </Button>
              )
            ) : (
              <Button
                size="sm"
                asChild
                className="rounded-full bg-accent text-black hover:bg-accent/90"
              >
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* --------------------- MOBILE TOGGLE ---------------------- */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className={cn(
              "md:hidden ml-auto p-2 rounded-full",
              scrolled
                ? "text-slate-900 hover:bg-slate-100"
                : "text-white hover:bg-white/10",
            )}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* ============================ MOBILE MENU ============================ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[2px] md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Side menu */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={MENU_SLIDE}
              className="fixed inset-y-0 right-0 z-[90] w-[90%] max-w-sm bg-[#0b1220]/80 backdrop-blur-xl text-white md:hidden pt-20 px-6 border-l border-white/10"
            >
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between py-4 px-2 text-xl font-heading font-bold border-b border-white/10",
                        location.pathname === link.href
                          ? "text-accent"
                          : "text-white/80 hover:text-accent",
                      )}
                    >
                      {link.name}
                      <ChevronRight className="w-5 h-5 opacity-40" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Auth actions */}
              <div className="mt-2 pt-2">
                {user ? (
                  isEditor && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 sm:py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  )
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 sm:py-4 rounded-xl bg-accent text-black font-semibold shadow-lg"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
