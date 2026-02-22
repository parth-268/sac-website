import { useState, useMemo } from "react";
import { Linkedin, Mail, Users, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTeamMembers, TeamMember } from "@/hooks/useTeamData";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Configuration ---

const ROLE_HIERARCHY: Record<string, number> = {
  president: 1,
  "vice president": 2,
  treasurer: 3,
  "general secretary": 4,
  coordinator: 99,
};

const normalizeRole = (role: string) => role.toLowerCase().trim();

// --- Animation Constants (SMOOTH & STABLE) ---

const CARD_TRANSITION = {
  type: "spring" as const,
  stiffness: 220,
  damping: 28,
  mass: 0.9,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: CARD_TRANSITION,
  },
};

// --- Helper Components ---

const FadeInImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-slate-300 z-0 transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100",
        )}
      >
        <Users className="h-10 w-10 opacity-20" />
      </div>

      {src ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out will-change-transform",
            "filter grayscale md:group-hover:grayscale-0 group-hover:scale-105",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          )}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-50">
          <Users className="h-12 w-12 text-slate-200" />
        </div>
      )}
    </div>
  );
};

const SocialLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-slate-400 hover:text-accent hover:bg-slate-50 rounded-full transition-all duration-200"
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
};

export const Team = () => {
  const { data: members, isLoading } = useTeamMembers();
  const shouldReduceMotion = useReducedMotion();

  // --- Data Processing ---
  const sortedMembers = useMemo(() => {
    if (!members) return [];

    return members
      .filter((m) => m.is_active)
      .sort((a, b) => {
        const roleA =
          ROLE_HIERARCHY[normalizeRole(a.designation)] ??
          ROLE_HIERARCHY.coordinator;
        const roleB =
          ROLE_HIERARCHY[normalizeRole(b.designation)] ??
          ROLE_HIERARCHY.coordinator;

        if (roleA !== roleB) return roleA - roleB;
        return a.name.localeCompare(b.name);
      });
  }, [members]);

  return (
    <section
      id="team"
      className="py-8 md:py-12 bg-slate-50 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.15,
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent" />

      <div className="container-wide mx-auto px-4 sm:px-6 relative z-10">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-left max-w-3xl mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#eab308]"></span>
            <span className="text-accent font-bold tracking-widest text-[10px] uppercase">
              The Council
            </span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2 leading-tight">
            Meet The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500">
              Team
            </span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl">
            The dedicated individuals working behind the scenes to foster
            community, leadership, and excellence at IIM Sambalpur.
          </p>
        </motion.div>

        {/* --- Team Grid --- */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden h-full aspect-[3/4] shadow-sm"
                >
                  <div className="h-full w-full bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : sortedMembers.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6"
                role="list"
                aria-label="Team members"
              >
                {sortedMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    layout
                    variants={cardVariants}
                    whileHover={
                      shouldReduceMotion ? undefined : { scale: 1.03 }
                    }
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                    transition={CARD_TRANSITION}
                    style={{ willChange: "transform" }}
                    className="group relative flex flex-col bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/20 transition-colors duration-300"
                    role="listitem"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 border-b border-slate-50">
                      <FadeInImage
                        src={member.image_url || undefined}
                        alt={member.name}
                      />
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-accent/0 group-hover:bg-accent transition-colors duration-300" />
                    </div>

                    <div className="p-4 flex flex-col flex-1 text-center">
                      <div className="mb-2">
                        <h3
                          className="font-heading text-base md:text-lg font-bold text-slate-900 leading-snug truncate focus:whitespace-normal focus:outline-none"
                          title={member.name}
                          tabIndex={0}
                        >
                          {member.name}
                        </h3>
                        <p
                          className="text-xs font-bold uppercase tracking-wider text-accent mt-1.5 truncate"
                          title={member.designation}
                        >
                          {member.designation}
                        </p>
                      </div>

                      <div className="mt-auto pt-2 border-t border-slate-50 flex justify-center gap-1">
                        {member.linkedin_url && (
                          <SocialLink
                            href={member.linkedin_url}
                            icon={Linkedin}
                            label="LinkedIn"
                          />
                        )}
                        {member.email && (
                          <SocialLink
                            href={`mailto:${member.email}`}
                            icon={Mail}
                            label="Email"
                          />
                        )}
                        {member.phone && (
                          <SocialLink
                            href={`tel:${member.phone}`}
                            icon={Phone}
                            label="Phone"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm"
            >
              <Users className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">
                No active team members found.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
