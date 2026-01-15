import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useEvents } from "@/hooks/useEvents";
import { useSacReports } from "@/hooks/useSacReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Clock,
  FileText,
  Download,
  CalendarDays,
  Archive,
} from "lucide-react";
import { format } from "date-fns";

const EventsPage = () => {
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: reports, isLoading: reportsLoading } = useSacReports();
  const [activeTab, setActiveTab] = useState("events");

  // Separate upcoming and past events
  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (!events) return { upcomingEvents: [], pastEvents: [] };
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.event_date) >= now);
    const past = events.filter((e) => new Date(e.event_date) < now);
    return {
      upcomingEvents: upcoming.sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
      ),
      pastEvents: past.sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
      ),
    };
  }, [events]);

  const EventCard = ({ event }: { event: NonNullable<typeof events>[0] }) => (
    <Card className="group hover:shadow-elevated transition-all overflow-hidden">
      {event.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4 text-accent" />
          <span>{format(new Date(event.event_date), "MMMM d, yyyy")}</span>
          {event.event_time && (
            <>
              <Clock className="h-4 w-4 ml-2" />
              <span>{event.event_time}</span>
            </>
          )}
        </div>
        <CardTitle className="font-heading text-xl">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground font-body text-sm line-clamp-3">
          {event.description}
        </p>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Events & Reports
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg max-w-2xl mx-auto">
            Stay updated with campus events and access annual SAC reports
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="events" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <Archive className="h-4 w-4" />
                Annual Reports
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-12">
              {eventsLoading ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Upcoming Events */}
                  {upcomingEvents.length > 0 && (
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-accent" />
                        Upcoming Events
                      </h2>
                      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Events */}
                  {pastEvents.length > 0 && (
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Archive className="h-6 w-6 text-muted-foreground" />
                        Past Events
                      </h2>
                      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {pastEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  )}

                  {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                    <div className="text-center py-16">
                      <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-body">
                        No events available yet
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              {reportsLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {reports.map((report) => (
                    <Card
                      key={report.id}
                      className="group hover:shadow-elevated transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-100 rounded-lg text-red-600 shrink-0">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-semibold text-foreground truncate">
                              {report.title}
                            </h3>
                            <p className="text-sm text-accent font-medium mt-1">
                              Academic Year {report.academic_year}
                            </p>
                            {report.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {report.description}
                              </p>
                            )}
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-4 text-sm text-accent hover:underline"
                            >
                              <Download className="h-4 w-4" />
                              Download PDF
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-body">
                    No reports available yet
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;
