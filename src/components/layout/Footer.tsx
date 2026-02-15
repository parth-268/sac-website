import { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { motion, useReducedMotion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, isEditor } = useAuth();

  // 1. FETCH DATA
  const { data: settings } = useSiteSettings();

  const reduceMotion = useReducedMotion();

  // 2. HELPER
  const getVal = useCallback(
    (key: string, fallback: string) =>
      settings?.find((s) => s.setting_key === key)?.setting_value || fallback,
    [settings],
  );

  // 3. DYNAMIC VALUES
  const copyrightText = getVal(
    "copyright_text",
    `© ${currentYear} SAC IIM Sambalpur. All rights reserved.`,
  );

  // Footer Description
  const footerDescription = getVal(
    "footer_description",
    "The apex student body fostering leadership, creativity, and community. Building a vibrant legacy for the future leaders.",
  );

  // Fetch Both Logos
  const sacLogoUrl = getVal("sac_logo_url", "");
  const collegeLogoUrl = getVal("college_logo_url", "");

  const socialLinks = [
    {
      icon: Instagram,
      href: getVal("social_instagram", ""),
      label: "Instagram",
    },
    { icon: Linkedin, href: getVal("social_linkedin", ""), label: "LinkedIn" },
    { icon: Twitter, href: getVal("social_twitter", ""), label: "Twitter" },
    { icon: Facebook, href: getVal("social_facebook", ""), label: "Facebook" },
  ];

  const quickLinks = [
    { label: "About SAC", to: "/#about" },
    { label: "Leadership Team", to: "/#team" },
    { label: "Events Calendar", to: "/#events" },
    { label: "Contact Us", to: "/#contact" },
  ];

  const resourceLinks = [
    { label: "Clubs & Committees", to: "/clubs" },
    { label: "Photo Gallery", to: "/gallery" },
    { label: "News & Updates", to: "/news" },
    { label: "Student Portal", to: "/login" },
  ];

  return (
    <footer className="bg-[#0a0f1d] pt-8 pb-6 relative overflow-hidden">
      {/* Watermark */}
      <div
        className="absolute -bottom-6 -right-6 md:-right-10 text-[12rem] md:text-[24rem] font-black font-heading leading-none text-transparent pointer-events-none select-none z-0"
        style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.08)" }}
      >
        SAC
      </div>

      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] opacity-40" />
      </div>

      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
        }
        className="container-wide mx-auto px-6 relative z-10"
      >
        <div className="grid md:grid-cols-12 gap-8 lg:gap-10 mb-4">
          {/* --- BRAND COLUMN (Logos) --- */}
          <div className="md:col-span-4 lg:col-span-5 space-y-5">
            {/* Logo Row */}
            <div className="flex items-center gap-4">
              {sacLogoUrl || collegeLogoUrl ? (
                <>
                  {/* IIM Logo */}
                  {collegeLogoUrl && (
                    <img
                      src={collegeLogoUrl}
                      alt="IIM Sambalpur"
                      className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                    />
                  )}

                  {/* Divider (Only if both exist) */}
                  {collegeLogoUrl && sacLogoUrl && (
                    <div className="h-8 w-[1px] bg-white/10" />
                  )}

                  {/* SAC Logo */}
                  {sacLogoUrl && (
                    <img
                      src={sacLogoUrl}
                      alt="SAC Logo"
                      className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                    />
                  )}
                </>
              ) : (
                // Fallback "S" Icon if no logos uploaded
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
              )}
            </div>

            {/* Text Content */}
            <div>
              <h3 className="font-heading text-sm font-bold text-white leading-none">
                Students' Affairs Council
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                IIM Sambalpur
              </p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mt-3 line-clamp-3">
                {footerDescription}
              </p>
            </div>

            <div className="flex gap-1 pt-1">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href || undefined}
                  target={social.href ? "_blank" : undefined}
                  rel={social.href ? "noopener noreferrer nofollow" : undefined}
                  aria-label={social.label}
                  aria-disabled={!social.href}
                  className={
                    social.href
                      ? "w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-300 will-change-transform hover:scale-[1.06] focus-visible:ring-1 focus-visible:ring-accent/40"
                      : "w-8 h-8 rounded-md flex items-center justify-center text-slate-700 cursor-not-allowed opacity-40"
                  }
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1" />

          {/* Links Column 1 */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-bold text-white mb-4 text-[10px] uppercase tracking-widest opacity-70">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-slate-400 hover:text-accent transition-colors text-xs flex items-center gap-2 group"
                  >
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-600 group-hover:bg-accent transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200 ease-out">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-bold text-white mb-4 text-[10px] uppercase tracking-widest opacity-70">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-slate-400 hover:text-accent transition-colors text-xs flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200 ease-out">
                      {item.label}
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 motion-safe:transition-colors motion-safe:duration-200">
          <p>{copyrightText}</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 hover:text-slate-400 transition-colors cursor-default">
              Made with{" "}
              <Heart className="w-3 h-3 text-red-500/80 fill-red-500/20" /> by
              SAC Team x APSK
            </span>

            {user && isEditor ? (
              <Link
                to="/admin"
                className="text-accent hover:text-white flex items-center gap-1 transition-colors font-medium"
              >
                <Settings className="w-3 h-3" /> Admin
              </Link>
            ) : (
              <Link
                to="/login"
                className="hover:text-white flex items-center gap-1 transition-colors opacity-40 hover:opacity-100"
              >
                <Settings className="w-3 h-3" /> Login
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </footer>
  );
};
