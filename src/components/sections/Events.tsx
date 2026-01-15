import { Calendar, MapPin, ArrowRight, Loader2, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const Events = () => {
  const { data: events, isLoading } = useUpcomingEvents(2);

  const formatEventDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="events" className="section-padding bg-primary">
      <div className="container-wide mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm tracking-wider uppercase mb-4 font-body">
            Stay Updated
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Upcoming Events
          </h2>
          <p className="text-primary-foreground/80 text-lg font-body leading-relaxed">
            Discover the exciting events and activities organized by SAC
            throughout the academic year.
          </p>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="group relative bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Tags */}
                <div className="flex gap-2 mb-4">
                  {event.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded-full font-body"
                    >
                      {tag}
                    </span>
                  ))}
                  {event.is_upcoming && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full font-body">
                      Upcoming
                    </span>
                  )}
                </div>

                <h3 className="font-heading text-xl md:text-2xl font-bold text-primary-foreground mb-3">
                  {event.title}
                </h3>

                <p className="text-primary-foreground/70 font-body mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/60 font-body mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{formatEventDate(event.event_date)}</span>
                    {event.event_time && <span>at {event.event_time}</span>}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="flex items-center text-accent font-medium text-sm group-hover:gap-2 transition-all">
                  <span className="font-body">Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarX className="h-12 w-12 mx-auto text-primary-foreground/50 mb-4" />
            <p className="text-primary-foreground/70">No events available</p>
          </div>
        )}

        {/* CTA */}
        {events && events.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="hero" size="xl" asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
