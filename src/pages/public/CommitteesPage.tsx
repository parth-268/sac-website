import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useCommittees } from "@/hooks/useCommittees";
import { useCommitteeMembers } from "@/hooks/useCommitteeMembers";
import { Building2, icons, ChevronRight, X, Mail } from "lucide-react";
import {
  motion,
  AnimatePresence,
  Variants,
  useReducedMotion,
} from "framer-motion";

const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    aria-hidden="true"
  />
);

const fadeUp = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0.2 }
      : { duration: 0.35, ease: "easeOut" },
  },
});

const overlay = (reduced: boolean): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: reduced
      ? { duration: 0.15 }
      : { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
});

const dialog = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0.2 }
      : { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: reduced ? 0 : 12,
    transition: { duration: 0.2 },
  },
});

const CommitteesPage = () => {
  const { data: committees, isLoading } = useCommittees();
  const [activeCommittee, setActiveCommittee] = useState<any | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const prefersReducedMotion = !!useReducedMotion();

  useEffect(() => {
    if (activeCommittee) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [activeCommittee]);

  useEffect(() => {
    if (!committees) return;

    const committeeId = searchParams.get("committee");
    if (!committeeId) return;

    const match = committees.find((c) => c.id === committeeId);
    if (match) {
      setActiveCommittee(match);
    }
  }, [committees, searchParams]);

  useEffect(() => {
    if (activeCommittee) {
      setSearchParams({ committee: activeCommittee.id }, { replace: true });
    } else {
      const params = new URLSearchParams(searchParams);
      params.delete("committee");
      setSearchParams(params, { replace: true });
    }
  }, [activeCommittee, searchParams, setSearchParams]);

  const { data: members, isLoading: membersLoading } = useCommitteeMembers(
    activeCommittee?.id,
  );

  useEffect(() => {
    if (!activeCommittee) return;

    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );

    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveCommittee(null);
        return;
      }

      if (e.key === "Tab" && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCommittee]);

  const getIcon = (iconName: string) => {
    const Icon = icons[iconName as keyof typeof icons] as any;
    return Icon ? (
      <Icon aria-hidden="true" className="h-5 w-5" />
    ) : (
      <Building2 aria-hidden="true" className="h-5 w-5" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Academic"
        highlight="Committees"
        description="Committees that ensure academic excellence, governance, and seamless student coordination."
        variant="centered"
      />

      <section className="py-10 md:py-14">
        <div className="container-wide mx-auto px-4">
          {isLoading ? (
            <div className="space-y-4 w-full max-w-sm">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : committees?.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              No committees available at the moment.
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.06 },
                },
              }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {committees
                ?.filter((committee) => committee.is_active)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((committee) => (
                  <motion.article
                    key={committee.id}
                    role="button"
                    tabIndex={0}
                    variants={fadeUp(prefersReducedMotion)}
                    whileHover={{ y: -2 }}
                    transition={{ type: "tween", duration: 0.2 }}
                    onClick={() => setActiveCommittee(committee)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setActiveCommittee(committee);
                      }
                    }}
                    className="group relative h-full rounded-2xl border border-border bg-card p-6 cursor-pointer hover:border-accent/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-accent group-hover:text-white transition-colors">
                        {getIcon(committee.icon)}
                      </div>
                      <h3 className="font-heading text-lg font-semibold leading-tight">
                        {committee.name}
                      </h3>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {committee.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        View details
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </motion.article>
                ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Committee Details Dialog */}
      <AnimatePresence>
        {activeCommittee && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlay(prefersReducedMotion)}
            onClick={() => setActiveCommittee(null)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="committee-title"
              variants={dialog(prefersReducedMotion)}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full md:max-w-2xl max-h-[85vh] md:max-h-[80vh] flex flex-col overflow-hidden rounded-t-2xl md:rounded-2xl bg-background p-6 md:p-8 shadow-xl overscroll-contain"
            >
              <button
                onClick={() => setActiveCommittee(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="mb-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary flex items-center justify-center">
                      {getIcon(activeCommittee.icon)}
                    </div>

                    <div className="flex-1">
                      <h2
                        id="committee-title"
                        className="font-heading text-xl font-semibold leading-tight"
                      >
                        {activeCommittee.name}
                      </h2>

                      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {activeCommittee.email && (
                          <a
                            href={`mailto:${activeCommittee.email}`}
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            <Mail className="h-4 w-4" />
                            {activeCommittee.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      About the Committee
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeCommittee.description}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">
                    Committee Members
                  </h3>

                  {membersLoading ? (
                    <ul className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <li key={i} className="px-4 py-3 border rounded-lg">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </li>
                      ))}
                    </ul>
                  ) : members?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Member details will be updated soon.
                    </p>
                  ) : (
                    <ul className="divide-y border rounded-lg overflow-hidden">
                      {members?.map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 text-sm"
                        >
                          {/* Left: Name & Designation */}
                          <div>
                            <div className="font-medium text-foreground">
                              {m.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {m.designation}
                            </div>
                          </div>

                          {/* Right: Phone */}
                          {m.phone && (
                            <div className="text-xs text-muted-foreground sm:text-right">
                              {m.phone}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>{" "}
              {/* scroll area */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default CommitteesPage;
