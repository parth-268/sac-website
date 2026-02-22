import { useState, useMemo, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useEvents } from "@/hooks/useEvents";
import { usePublicSacReports } from "@/hooks/useSacReports";
import { useActiveAcademicYear } from "@/hooks/useAcademicYears";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  Download,
  FileText,
  CalendarDays,
  X,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import {
  motion,
  Variants,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

type EventRow = Tables<"events">;

const fadeUp = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.5, ease: "easeOut" },
  },
});

export default function EventsPage() {
  const { data: activeAcademicYear } = useActiveAcademicYear();
  const { data: events, isLoading: eventsLoading } = useEvents(
    activeAcademicYear?.year,
  );
  const { data: reports, isLoading: reportsLoading } = usePublicSacReports();
  const [activeTab, setActiveTab] = useState("events");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "events" || tab === "reports" || tab === "others") {
      setActiveTab(tab);
    }
  }, []);

  const onTabChange = (v: string) => {
    setActiveTab(v);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", v);
    window.history.replaceState({}, "", `?${params.toString()}`);
  };
  const prefersReducedMotion = useReducedMotion();

  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [activeReportUrl, setActiveReportUrl] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = activeEvent ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeEvent]);

  useEffect(() => {
    if (!activeEvent) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveEvent(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeEvent]);

  const isPageLoading = eventsLoading || !activeAcademicYear;

  const motionVariants = useMemo(
    () => fadeUp(!!prefersReducedMotion),
    [prefersReducedMotion],
  );

  const { upcoming, past } = useMemo(() => {
    if (!events) return { upcoming: [], past: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      upcoming: events.filter((e) => {
        const d = new Date(e.event_date);
        d.setHours(0, 0, 0, 0);
        return d >= today;
      }),
      past: events.filter((e) => {
        const d = new Date(e.event_date);
        d.setHours(0, 0, 0, 0);
        return d < today;
      }),
    };
  }, [events]);

  // Split reports into sacReports and otherReports
  const { sacReports, otherReports } = useMemo(() => {
    if (!reports) return { sacReports: [], otherReports: [] };
    return {
      sacReports: reports.filter((r) => r.document_type === "sac_annual"),
      otherReports: reports.filter((r) => r.document_type === "other"),
    };
  }, [reports]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Campus"
        highlight="Happenings"
        description="Workshops, fests, talks, celebrations and life at IIM Sambalpur."
        pattern="dots"
        variant="centered"
      />

      <main className="container-wide py-8 md:py-10">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <TabsList className="h-10 rounded-full bg-secondary p-1">
              <TabsTrigger
                value="events"
                className="rounded-full px-6 text-xs font-bold uppercase data-[state=active]:bg-background"
              >
                Events
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-full px-6 text-xs font-bold uppercase data-[state=active]:bg-background"
              >
                SAC Reports
              </TabsTrigger>
              <TabsTrigger
                value="others"
                className="rounded-full px-6 text-xs font-bold uppercase data-[state=active]:bg-background"
              >
                Other Documents
              </TabsTrigger>
            </TabsList>
          </div>

          {/* EVENTS */}
          <TabsContent value="events">
            {isPageLoading ? (
              <EventsSkeleton />
            ) : (
              <div className="space-y-14">
                {upcoming.length === 0 && past.length === 0 && (
                  <div className="text-sm text-muted-foreground py-12 text-center">
                    No events announced yet.
                  </div>
                )}
                {upcoming.length > 0 && (
                  <Section title="Upcoming" accent="green">
                    <CardGrid>
                      {upcoming.map((event, i) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          delay={i * 0.04}
                          variants={motionVariants}
                          onClick={() => setActiveEvent(event)}
                        />
                      ))}
                    </CardGrid>
                  </Section>
                )}

                {past.length > 0 && (
                  <Section title="Past Events" muted>
                    <CardGrid>
                      {past.map((event, i) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          delay={i * 0.03}
                          variants={motionVariants}
                          muted
                          onClick={() => setActiveEvent(event)}
                        />
                      ))}
                    </CardGrid>
                  </Section>
                )}
              </div>
            )}
          </TabsContent>

          {/* SAC REPORTS */}
          <TabsContent value="reports">
            {reportsLoading ? (
              <ReportsSkeleton />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {sacReports && sacReports.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    No reports available yet.
                  </div>
                )}
                {sacReports?.map((report, i) => (
                  <motion.div
                    key={report.id}
                    variants={motionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/40"
                  >
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        FY {report.academic_year}
                      </p>
                    </div>
                    {report.file_url && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActiveReportUrl(report.file_url)}
                          className="text-xs font-bold text-accent hover:underline flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/10"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </button>
                        <a
                          href={report.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/10"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* OTHER DOCUMENTS */}
          <TabsContent value="others">
            {reportsLoading ? (
              <ReportsSkeleton />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {otherReports && otherReports.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    No reports available yet.
                  </div>
                )}
                {otherReports?.map((report, i) => (
                  <motion.div
                    key={report.id}
                    variants={motionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/40"
                  >
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        FY {report.academic_year}
                      </p>
                    </div>
                    {report.file_url && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActiveReportUrl(report.file_url)}
                          className="text-xs font-bold text-accent hover:underline flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/10"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </button>
                        <a
                          href={report.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/10"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AnimatePresence>
        {activeEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveEvent(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: prefersReducedMotion ? 0 : 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: prefersReducedMotion ? 0 : 80, opacity: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: "easeOut",
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full md:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-t-2xl md:rounded-2xl bg-background shadow-xl"
            >
              {/* Close */}
              <button
                onClick={() => setActiveEvent(null)}
                className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="relative h-48 bg-secondary">
                {activeEvent.banner_image_url ? (
                  <img
                    src={activeEvent.banner_image_url}
                    alt={activeEvent.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground/40">
                    <CalendarDays className="w-10 h-10" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                <div className="space-y-3">
                  <h2 className="font-heading text-2xl font-bold">
                    {activeEvent.title}
                  </h2>

                  {/* Conducted By */}
                  {activeEvent.conducted_by_name && (
                    <div className="text-xs text-muted-foreground">
                      Organised By{" "}
                      <span className="font-medium text-foreground">
                        {activeEvent.conducted_by_name}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" />
                      {format(new Date(activeEvent.event_date), "dd MMM yyyy")}
                    </span>

                    {activeEvent.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activeEvent.start_time}
                        {activeEvent.end_time && ` – ${activeEvent.end_time}`}
                      </span>
                    )}

                    {activeEvent.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {activeEvent.map_link ? (
                          <a
                            href={activeEvent.map_link}
                            target="_blank"
                            className="underline inline-flex items-center gap-1"
                          >
                            {activeEvent.venue}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          activeEvent.venue
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    About the Event
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {activeEvent.short_description ?? activeEvent.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeReportUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveReportUrl(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[85vh] bg-background rounded-xl overflow-hidden shadow-xl"
            >
              <button
                onClick={() => setActiveReportUrl(null)}
                className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
                aria-label="Close report viewer"
              >
                <X className="w-5 h-5" />
              </button>

              {activeReportUrl && activeReportUrl.startsWith("http") && (
                <iframe
                  src={activeReportUrl}
                  className="w-full h-full"
                  loading="lazy"
                  title="Report PDF"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

/* ---------------- UI Pieces ---------------- */

function Section({
  title,
  children,
  accent,
  muted,
}: {
  title: string;
  children: React.ReactNode;
  accent?: "green";
  muted?: boolean;
}) {
  return (
    <section>
      <h3
        className={`mb-4 text-sm font-bold uppercase tracking-wide ${
          muted
            ? "text-muted-foreground"
            : accent === "green"
              ? "text-green-600"
              : ""
        }`}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  );
}

function EventCard({
  event,
  delay,
  variants,
  muted,
  onClick,
}: {
  event: EventRow;
  delay: number;
  variants: Variants;
  muted?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay }}
      className={`group bg-card border border-border rounded-xl overflow-hidden ${
        muted ? "opacity-80" : ""
      } hover:shadow-md transition-shadow duration-200`}
    >
      <div className="relative h-36 bg-secondary overflow-hidden">
        {event.banner_image_url ? (
          <img
            src={event.banner_image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/30">
            <CalendarDays className="w-8 h-8" />
          </div>
        )}

        <div className="absolute top-2 left-2 rounded-lg bg-background/95 backdrop-blur px-2 py-1 border border-border text-center">
          <div className="text-sm font-bold leading-none">
            {format(new Date(event.event_date), "dd")}
          </div>
          <div className="text-[9px] uppercase text-muted-foreground">
            {format(new Date(event.event_date), "MMM")}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-accent">
          {event.title}
        </h4>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {event.start_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.start_time}
              {event.end_time && ` – ${event.end_time}`}
            </span>
          )}

          {event.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.venue}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {event.short_description ?? event.description}
        </p>
      </div>
    </motion.article>
  );
}

/* ---------------- Skeletons ---------------- */

function EventsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <Skeleton className="h-32 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
        >
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
