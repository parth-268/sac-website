import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useClubs } from "@/hooks/useClubs";
import { useClubMembers } from "@/hooks/useClubMembers";
import {
  Users,
  Instagram,
  Linkedin,
  ArrowUpRight,
  X,
  Mail,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  Variants,
} from "framer-motion";
import { icons } from "lucide-react";
import { useState, useEffect } from "react";

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const ClubsPage = () => {
  const prefersReducedMotion = !!useReducedMotion();
  const [activeClub, setActiveClub] = useState<any | null>(null);

  useEffect(() => {
    if (activeClub) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [activeClub]);

  const dialog: Variants = {
    hidden: { y: prefersReducedMotion ? 0 : 12, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.2 }
        : { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const { data: clubs, isLoading } = useClubs();

  const { data: seniorMembers } = useClubMembers(activeClub?.id, "senior");

  const getIcon = (iconName: string) => {
    const Icon = icons[iconName as keyof typeof icons] as any;
    return Icon ? <Icon className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Clubs &"
        highlight="Contingents"
        description="Explore student-led bodies that fuel innovation, culture, and leadership at IIM Sambalpur."
        pattern="dots"
        variant="centered"
      />

      <section className="py-10 md:py-14">
        <div className="container-wide mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <motion.div
                className="w-7 h-7 rounded-full border-4 border-accent border-t-transparent animate-spin"
                aria-label="Loading"
              />
            </div>
          ) : clubs && clubs.length === 0 ? (
            <div className="text-center py-20 text-sm text-muted-foreground">
              Clubs information will be updated soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs?.map((club, index) => (
                <motion.article
                  key={club.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open details for ${club.name}`}
                  onClick={() => setActiveClub(club)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveClub(club);
                    }
                  }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: index * 0.04,
                  }}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {/* Image / Header */}
                  <div className="relative h-36 bg-secondary overflow-hidden">
                    {club.image_url ? (
                      <img
                        src={club.image_url}
                        alt={club.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <Users className="w-10 h-10" />
                      </div>
                    )}

                    {/* Icon badge */}
                    <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-md p-2 rounded-lg border border-border shadow-sm text-accent">
                      {getIcon(club.icon)}
                    </div>

                    {/* Members */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-semibold text-white border border-white/10">
                      {club.senior_count + club.junior_count > 0
                        ? `${club.senior_count + club.junior_count} members`
                        : "Active"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1 line-clamp-1">
                      {club.name}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {club.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                      {/* Social links */}
                      <div className="flex items-center gap-3">
                        {club.instagram_url ? (
                          <a
                            href={club.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-accent transition-colors"
                            aria-label="Instagram"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        ) : (
                          <Instagram className="w-4 h-4 text-muted-foreground/30" />
                        )}

                        {club.linkedin_url ? (
                          <a
                            href={club.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-accent transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        ) : (
                          <Linkedin className="w-4 h-4 text-muted-foreground/30" />
                        )}
                      </div>

                      {/* CTA */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveClub(club);
                        }}
                        className="text-xs font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                      >
                        Explore
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Club Details Dialog */}
      <AnimatePresence>
        {activeClub && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlay}
            onClick={() => setActiveClub(null)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.15 }
                  : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
              }
            />

            {/* Dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="club-title"
              variants={dialog}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full md:max-w-2xl max-h-[85vh] md:max-h-[85vh] flex flex-col overflow-hidden rounded-t-2xl md:rounded-2xl bg-background shadow-xl overscroll-contain"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b">
                <button
                  onClick={() => setActiveClub(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary flex items-center justify-center">
                    {getIcon(activeClub.icon)}
                  </div>

                  <div className="flex-1">
                    <h2
                      id="club-title"
                      className="font-heading text-xl font-semibold leading-tight"
                    >
                      {activeClub.name}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {activeClub.senior_count + activeClub.junior_count}{" "}
                        Members
                      </span>

                      {activeClub.email && (
                        <a
                          href={`mailto:${activeClub.email}`}
                          className="inline-flex items-center gap-1 text-accent hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {activeClub.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* About */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    About the Club
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activeClub.description}
                  </p>
                </section>

                {/* Senior Members */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Senior Team
                  </h3>

                  {!seniorMembers ? (
                    <ul className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <li key={i} className="px-4 py-3 border rounded-lg">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </li>
                      ))}
                    </ul>
                  ) : seniorMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Senior team details will be updated soon.
                    </p>
                  ) : (
                    <ul className="divide-y border rounded-lg overflow-hidden bg-background">
                      {seniorMembers.map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 text-sm"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              {m.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {m.designation}
                            </div>
                          </div>

                          {m.phone && (
                            <div className="text-xs text-muted-foreground">
                              {m.phone}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Social links */}
                <section className="flex items-center gap-4 pt-2">
                  {activeClub.instagram_url ? (
                    <a
                      href={activeClub.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  ) : (
                    <Instagram className="h-5 w-5 text-muted-foreground/30" />
                  )}

                  {activeClub.linkedin_url ? (
                    <a
                      href={activeClub.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  ) : (
                    <Linkedin className="h-5 w-5 text-muted-foreground/30" />
                  )}
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ClubsPage;
