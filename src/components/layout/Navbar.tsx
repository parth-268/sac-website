import { useState, useEffect } from "react";
import { Menu, X, Settings, ChevronRight, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings"; // IMPORT HOOK

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

  // 1. FETCH LOGO SETTING
  const { data: settings } = useSiteSettings();
  const sacLogoUrl = settings?.find(
    (s) => s.setting_key === "sac_logo_url",
  )?.setting_value;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  // Contrast Logic
  const darkHeroPages = ["/", "/clubs", "/committees", "/events", "/alumni"];
  const hasDarkHero = darkHeroPages.some((path) => location.pathname === path);
  const useDarkText = isOpen || scrolled || !hasDarkHero;

  const navBackground = scrolled
    ? "bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm"
    : "bg-transparent";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
          navBackground,
          scrolled ? "h-16" : "h-20",
        )}
      >
        <div className="w-full max-w-7xl mx-auto px-6 h-full flex items-center">
          {/* --- LOGO (Left) --- */}
          <Link
            to="/"
            className="relative z-[101] flex items-center gap-3 group mr-8"
          >
            {/* DYNAMIC LOGO LOGIC */}
            {sacLogoUrl ? (
              <img
                src={sacLogoUrl}
                alt="SAC Logo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:rotate-12 transition-transform duration-300">
                S
              </div>
            )}

            <div className="flex flex-col justify-center">
              <span
                className={cn(
                  "font-heading font-bold text-base leading-none transition-colors duration-300",
                  useDarkText ? "text-slate-900" : "text-white",
                )}
              >
                Student Council
              </span>
              <span
                className={cn(
                  "text-[9px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 mt-0.5",
                  useDarkText ? "text-slate-500" : "text-white/60",
                )}
              >
                IIM Sambalpur
              </span>
            </div>
          </Link>

          {/* --- RIGHT ALIGNED GROUP (Links + Login) --- */}
          <div className="ml-auto hidden md:flex items-center gap-6">
            {/* Nav Links */}
            <div className="flex items-center gap-1 bg-transparent p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    location.pathname === link.href
                      ? "text-accent font-semibold"
                      : useDarkText
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        : "text-white/80 hover:text-white hover:bg-white/10",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Button */}
            <div className="pl-2 border-l border-white/10">
              {user ? (
                isEditor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={cn(
                      "gap-2 font-medium rounded-full transition-all border",
                      useDarkText
                        ? "border-slate-200 hover:bg-slate-100 text-slate-700"
                        : "border-white/20 hover:bg-white/10 text-white",
                    )}
                  >
                    <Link to="/admin">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Link>
                  </Button>
                )
              ) : (
                <Button
                  size="sm"
                  asChild
                  className={cn(
                    "gap-2 font-bold rounded-full transition-all shadow-lg px-6",
                    useDarkText
                      ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl"
                      : "bg-white text-slate-900 hover:bg-white/90 hover:shadow-white/20",
                  )}
                >
                  <Link to="/login">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "md:hidden ml-auto relative z-[101] p-2 rounded-full transition-colors focus:outline-none",
              useDarkText
                ? "text-slate-900 hover:bg-slate-100"
                : "text-white hover:bg-white/10",
            )}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[90] bg-white md:hidden flex flex-col pt-24 px-6 h-screen overflow-y-auto"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between text-2xl font-heading font-bold py-4 border-b border-slate-100 transition-colors",
                      location.pathname === link.href
                        ? "text-accent pl-2"
                        : "text-slate-800 hover:text-accent hover:pl-2",
                    )}
                  >
                    {link.name}
                    <ChevronRight
                      className={cn(
                        "transition-all duration-300",
                        location.pathname === link.href
                          ? "text-accent opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-4",
                      )}
                    />
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-8"
              >
                {user ? (
                  isEditor && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-900 text-white font-medium shadow-lg hover:scale-[1.02] transition-transform"
                    >
                      <Settings className="w-5 h-5" /> Admin Dashboard
                    </Link>
                  )
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-accent text-white font-bold shadow-lg hover:bg-accent/90 transition-colors"
                  >
                    <LogIn className="w-5 h-5" /> Team Login
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
