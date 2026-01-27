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
import { motion } from "framer-motion";

const EventsPage = () => {
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: reports, isLoading: reportsLoading } = useSacReports();
  const [activeTab, setActiveTab] = useState("events");

  const { upcoming, past } = useMemo(() => {
    if (!events) return { upcoming: [], past: [] };
    const now = new Date();
    return {
      upcoming: events
        .filter((e) => new Date(e.event_date) >= now)
        .sort(
          (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
        ),
      past: events
        .filter((e) => new Date(e.event_date) < now)
        .sort(
          (a, b) =>
            new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
        ),
    };
  }, [events]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Campus"
        highlight="Happenings"
        description="Stay updated with workshops, fests, and celebrations."
        pattern="waves"
      />

      <div className="container-wide mx-auto px-4 py-8 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-secondary h-9 p-1 rounded-full">
              <TabsTrigger
                value="events"
                className="rounded-full px-6 text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-full px-6 text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events" className="space-y-12">
            {eventsLoading ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <>
                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <section>
                    <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
                      Upcoming
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcoming.map((e, i) => (
                        <EventCard
                          key={e.id}
                          event={e}
                          delay={i * 0.1}
                          isUpcoming
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Past */}
                <section>
                  <h3 className="font-heading text-lg font-bold text-muted-foreground mb-4 opacity-70">
                    Past Events
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                    {past.map((e, i) => (
                      <EventCard key={e.id} event={e} delay={i * 0.1} />
                    ))}
                  </div>
                </section>
              </>
            )}
          </TabsContent>

          <TabsContent value="reports">
            {reportsLoading ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin text-accent" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {reports?.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/40 transition-colors"
                  >
                    <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">
                        {report.title}
                      </h4>
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
                        <Download className="w-3 h-3" /> PDF
                      </a>
                    )}
                  </div>
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
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/40 shadow-sm transition-all flex flex-col h-full"
  >
    <div className="h-32 bg-secondary/50 relative overflow-hidden">
      {event.image_url ? (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
          <CalendarDays className="w-8 h-8" />
        </div>
      )}
      <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-md px-2 py-1 rounded-lg text-center shadow-sm border border-border/50">
        <div className="text-sm font-bold text-foreground leading-none">
          {format(new Date(event.event_date), "dd")}
        </div>
        <div className="text-[9px] uppercase font-bold text-muted-foreground">
          {format(new Date(event.event_date), "MMM")}
        </div>
      </div>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-heading text-base font-bold mb-1 line-clamp-1 group-hover:text-accent transition-colors">
        {event.title}
      </h3>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        {event.event_time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {event.event_time}
          </span>
        )}
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {event.location}
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
