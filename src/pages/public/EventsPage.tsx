import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useEvents } from "@/hooks/useEvents";
import { useSacReports } from "@/hooks/useSacReports";
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
  const { data: reports, isLoading: reportsLoading } = useSacReports();
  const [activeTab, setActiveTab] = useState("events");
  const prefersReducedMotion = useReducedMotion();

  const [activeEvent, setActiveEvent] = useState<any | null>(null);

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

      <main className="container-wide py-10 md:py-14">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs */}
          <div className="flex justify-center mb-12">
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
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          {/* EVENTS */}
          <TabsContent value="events">
            {isPageLoading ? (
              <EventsSkeleton />
            ) : (
              <div className="space-y-14">
                {upcoming.length > 0 && (
                  <Section title="Upcoming" accent="green">
                    <CardGrid>
                      {upcoming.map((event, i) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          delay={i * 0.04}
                          variants={fadeUp(!!prefersReducedMotion)}
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
                          variants={fadeUp(!!prefersReducedMotion)}
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

          {/* REPORTS */}
          <TabsContent value="reports">
            {reportsLoading ? (
              <ReportsSkeleton />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {reports?.map((report, i) => (
                  <motion.div
                    key={report.id}
                    variants={fadeUp(!!prefersReducedMotion)}
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
                      <a
                        href={report.file_url}
                        target="_blank"
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </a>
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
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeEvent.description}
                  </p>
                </div>
              </div>
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
  event: any;
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
      } hover:border-accent/40`}
    >
      <div className="relative h-36 bg-secondary overflow-hidden">
        {event.banner_image_url ? (
          <img
            src={event.banner_image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          {event.description}
        </p>
      </div>
    </motion.article>
  );
}

/* ---------------- Skeletons ---------------- */

function EventsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
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
