import {
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
  CalendarX,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Animation Variants (Consistent with Team/About) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 60, damping: 20 },
  },
};

export const Events = () => {
  const { data: events, isLoading } = useUpcomingEvents(3);

  const getDay = (dateStr: string) => format(new Date(dateStr), "dd");
  const getMonth = (dateStr: string) => format(new Date(dateStr), "MMM");

  return (
    <section
      id="events"
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
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#eab308]"></span>
              <span className="text-accent font-bold tracking-widest text-[10px] uppercase">
                Campus Life
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2 leading-tight">
              Upcoming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500">
                Events
              </span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
              Celebrations, workshops, and cultural fests at IIM Sambalpur.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <Button
              variant="outline"
              asChild
              className="group border-slate-200 text-slate-600 hover:text-accent hover:border-accent/50 transition-all"
            >
              <Link to="/events" className="flex items-center gap-2">
                View Calendar{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* --- Compact Events Grid --- */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : events && events.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {events.slice(0, 3).map((event) => (
              <motion.div
                key={event.id}
                variants={cardVariants}
                className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-accent/30 transition-all duration-300 h-full"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <Calendar className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  {/* Date Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-white/50 rounded-xl px-3 py-1.5 text-center min-w-[56px] shadow-sm">
                    <span className="block text-lg font-bold text-slate-900 leading-none">
                      {getDay(event.event_date)}
                    </span>
                    <span className="block text-[10px] font-bold text-accent uppercase tracking-wider mt-0.5">
                      {getMonth(event.event_date)}
                    </span>
                  </div>

                  {/* Status Tag */}
                  {event.is_upcoming && (
                    <div className="absolute top-3 right-3 bg-accent text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">
                      Upcoming
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                    {event.title}
                  </h3>

                  <div className="flex flex-col gap-2 mb-4">
                    {event.event_time && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        {event.event_time}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">
                      Details
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <CalendarX className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">
              No upcoming events scheduled.
            </p>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 md:hidden text-center">
          <Button
            variant="outline"
            asChild
            className="w-full border-slate-200 text-slate-600 hover:text-accent"
          >
            <Link to="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
