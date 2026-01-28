import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition } from "framer-motion";

// --- Animation Config (calm + premium) ---
const CARD_TRANSITION: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 26,
  mass: 0.9,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: CARD_TRANSITION,
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
      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.12,
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent" />

      <div className="container-wide mx-auto px-4 sm:px-6 relative z-10">
        {/* ---------- Header ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#eab308]" />
              <span className="text-accent font-bold tracking-widest text-[10px] uppercase">
                Campus Life
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-1">
              Upcoming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500">
                Events
              </span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
              Celebrations, workshops, and cultural moments at IIM Sambalpur.
            </p>
          </div>

          <div className="hidden md:block">
            <Button
              variant="outline"
              asChild
              className="group border-slate-200 text-slate-600"
            >
              <Link to="/events" className="flex items-center gap-2">
                View Calendar
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* ---------- Content ---------- */}
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : events && events.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {events.slice(0, 3).map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={CARD_TRANSITION}
                  style={{ willChange: "transform" }}
                  className="group relative flex flex-col bg-white border border-slate-200/60 rounded-xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition-colors"
                >
                  {/* Image */}
                  <div className="relative h-40 sm:h-44 overflow-hidden bg-slate-100">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <Calendar className="w-8 h-8 text-slate-300" />
                      </div>
                    )}

                    {/* Date badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur border border-white/60 rounded-lg px-2.5 py-1 text-center shadow-sm">
                      <span className="block text-base font-bold text-slate-900 leading-none">
                        {getDay(event.event_date)}
                      </span>
                      <span className="block text-[9px] font-bold text-accent uppercase tracking-wider">
                        {getMonth(event.event_date)}
                      </span>
                    </div>

                    {/* Status */}
                    {event.is_upcoming && (
                      <div className="absolute top-3 right-3 bg-accent text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">
                        Upcoming
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-heading text-base font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-accent transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex flex-col gap-1.5 mb-3 text-[11px] text-slate-500 font-medium">
                      {event.event_time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          {event.event_time}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          {event.location}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {event.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-accent transition-colors">
                        View Details
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200"
          >
            <CalendarX className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">
              No upcoming events scheduled.
            </p>
          </motion.div>
        )}

        {/* Mobile CTA */}
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
