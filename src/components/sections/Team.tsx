import { useState } from "react";
import { Linkedin, Mail, Users, Phone } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamData"; // Consolidated Hook
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Variants } from "framer-motion";

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

// --- Helper Components ---
const FadeInImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full relative bg-slate-100">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 z-0">
          <Users className="h-8 w-8 opacity-20" />
        </div>
      )}

      {src ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out",
            // Keep the grayscale-to-color effect on hover as it's a nice touch
            "filter grayscale group-hover:grayscale-0",
            "group-hover:scale-105",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          )}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Users className="h-10 w-10 text-slate-200" />
        </div>
      )}
    </div>
  );
};

const SocialLink = ({ href, icon: Icon, label }: any) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-1.5 text-slate-400 hover:text-accent hover:bg-slate-50 rounded-md transition-colors"
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </a>
  );
};

export const Team = () => {
  // Use new hook: automatically filters active members
  const { data: members, isLoading } = useTeamMembers();

  return (
    <section
      id="team"
      className="py-8 md:py-12 bg-slate-50 relative overflow-hidden"
    >
      {/* --- VISIBLE BACKGROUND GRID --- */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.15, // Increased visibility
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent" />

      <div className="container-wide mx-auto px-4 sm:px-6 relative z-10">
        {/* --- Header (Left Aligned) --- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-left max-w-3xl mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm">
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
            // Skeleton Loader
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden h-full aspect-[3/4]"
                >
                  <div className="h-full w-full bg-slate-200 animate-pulse" />
                </div>
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  variants={cardVariants}
                  className="group flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300 will-change-transform"
                >
                  {/* Image Area */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 border-b border-slate-50">
                    <FadeInImage
                      src={member.image_url || undefined}
                      alt={member.name}
                    />
                  </div>

                  {/* Info Area */}
                  <div className="p-4 text-center flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="font-heading text-sm md:text-base font-bold text-slate-900 truncate px-1">
                        {member.name}
                      </h3>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-accent mt-1 truncate px-1">
                        {member.designation}
                      </p>
                    </div>

                    {/* Socials - Always Visible */}
                    <div className="mt-auto pt-3 border-t border-slate-50 flex justify-center gap-2">
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
                      {/* Optional Phone (if your schema supports it later) */}
                      {/* <SocialLink href="tel:..." icon={Phone} label="Phone" /> */}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm">
                No active team members found.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
