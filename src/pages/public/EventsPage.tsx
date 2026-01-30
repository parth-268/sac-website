import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useEvents } from "@/hooks/useEvents";
import { useSacReports } from "@/hooks/useSacReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  Download,
  FileText,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const EventsPage = () => {
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: reports, isLoading: reportsLoading } = useSacReports();
  const [activeTab, setActiveTab] = useState("events");

  const { upcoming, past } = useMemo(() => {
    if (!events) return { upcoming: [], past: [] };
    const now = new Date();
    return {
      upcoming: events.filter((e) => new Date(e.event_date) >= now),
      past: events.filter((e) => new Date(e.event_date) < now),
    };
  }, [events]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Campus"
        highlight="Happenings"
        description="Workshops, fests, talks and celebrations at IIM Sambalpur."
        pattern="dots"
        variant="centered"
      />

      <div className="container-wide py-10 md:py-14">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs Header */}
          <div className="flex justify-center mb-10">
            <TabsList className="h-9 rounded-full bg-secondary p-1">
              <TabsTrigger
                value="events"
                className="rounded-full px-6 text-xs font-bold uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-full px-6 text-xs font-bold uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          {/* EVENTS TAB */}
          <TabsContent value="events">
            {eventsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="space-y-12">
                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide mb-4">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Upcoming
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcoming.map((event, i) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          delay={i * 0.05}
                          isUpcoming
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Past */}
                {past.length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">
                      Past Events
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                      {past.map((event, i) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          delay={i * 0.04}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports">
            {reportsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-accent" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {reports?.map((report: any, i: number) => (
                  <motion.div
                    key={report.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/40 transition-colors"
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
      </div>

      <Footer />
    </div>
  );
};

const EventCard = ({ event, delay, isUpcoming }: any) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{ delay }}
    className="group bg-card border border-border rounded-xl overflow-hidden hover:border-accent/40 transition-colors"
  >
    <div className="relative h-28 bg-secondary">
      {event.image_url ? (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground/30">
          <CalendarDays className="w-8 h-8" />
        </div>
      )}

      {/* Date Badge */}
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
      <h4 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">
        {event.title}
      </h4>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {event.event_time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {event.event_time}
          </span>
        )}
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {event.location}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {event.description}
      </p>
    </div>
  </motion.div>
);

export default EventsPage;
