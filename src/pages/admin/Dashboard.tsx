import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTeamMembers, useAlumniMembers } from "@/hooks/useTeamData";
import { useEvents } from "@/hooks/useEvents";
import { useCommittees } from "@/hooks/useCommittees";
import { useContactSubmissions } from "@/hooks/useContactInfo";
import { useClubs } from "@/hooks/useClubs";
import { useAuth } from "@/contexts/useAuth";
import {
  Users,
  Calendar,
  Building2,
  MessageSquare,
  GraduationCap,
  Briefcase,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveAcademicYear } from "@/hooks/useAcademicYears";

const StatCard = ({
  title,
  value,
  icon: Icon,
  href,
  colorClass,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  colorClass: string;
  isLoading: boolean;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      role="region"
      aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-label`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...(shouldReduceMotion && { initial: false, animate: false })}
      className="h-full"
    >
      <Link
        to={href}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-2xl"
        aria-describedby={`${title.replace(/\s+/g, "-").toLowerCase()}-desc`}
      >
        <div className="group h-full bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/40 hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
          <header className="flex justify-between items-start mb-4">
            <div
              className={cn(
                "p-3 rounded-xl bg-slate-50 transition-colors group-hover:bg-accent/10",
                colorClass,
              )}
              aria-hidden="true"
            >
              <Icon className="w-6 h-6" />
            </div>
            <div
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-accent group-hover:text-white transition-all"
              aria-hidden="true"
            >
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </header>

          <section>
            {isLoading ? (
              <Skeleton
                className="h-9 w-16 mb-1"
                aria-label={`${title} loading`}
              />
            ) : (
              <h3
                id={`${title.replace(/\s+/g, "-").toLowerCase()}-label`}
                className="text-3xl font-bold text-slate-900 mb-1 font-heading"
              >
                {value}
              </h3>
            )}
            <p
              id={`${title.replace(/\s+/g, "-").toLowerCase()}-desc`}
              className="text-sm font-medium text-slate-500"
            >
              {title}
            </p>
          </section>

          <div
            className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 group-hover:bg-accent/5 transition-all duration-500 -z-0 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.article>
  );
};

const ActionCard = ({
  title,
  desc,
  href,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      role="region"
      aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-action-label`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      {...(shouldReduceMotion && { initial: false, animate: false })}
      className="h-full"
    >
      <Link
        to={href}
        className="flex items-center gap-4 p-4 h-full bg-white border border-slate-100 rounded-xl hover:border-accent/50 hover:bg-slate-50/50 transition-all group shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-describedby={`${title.replace(/\s+/g, "-").toLowerCase()}-action-desc`}
      >
        <div
          className="w-12 h-12 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-accent group-hover:text-white transition-colors"
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4
            id={`${title.replace(/\s+/g, "-").toLowerCase()}-action-label`}
            className="font-bold text-slate-800 text-sm group-hover:text-accent transition-colors"
          >
            {title}
          </h4>
          <p
            id={`${title.replace(/\s+/g, "-").toLowerCase()}-action-desc`}
            className="text-xs text-slate-500 line-clamp-1"
          >
            {desc}
          </p>
        </div>
      </Link>
    </motion.article>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();

  // Data Hooks
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();
  const { data: alumni, isLoading: alumniLoading } = useAlumniMembers();
  const { data: activeAcademicYear } = useActiveAcademicYear();
  const { data: events, isLoading: eventsLoading } = useEvents(
    activeAcademicYear?.year,
  );
  const { data: committees, isLoading: commLoading } = useCommittees();
  const { data: messages, isLoading: msgLoading } = useContactSubmissions();
  const { data: clubs, isLoading: clubsLoading } = useClubs();

  const unreadMessages = messages?.filter((m) => !m.is_read).length || 0;
  const upcomingEventsCount = events?.length || 0;

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting = "Welcome";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  // Date Formatter
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      title: "Team Members",
      value: teamMembers?.length || 0,
      icon: Users,
      href: "/admin/team",
      colorClass: "text-blue-600 group-hover:text-blue-700",
      isLoading: teamLoading,
    },
    {
      title: "Upcoming Events",
      value: upcomingEventsCount,
      icon: Calendar,
      href: "/admin/events",
      colorClass: "text-amber-500 group-hover:text-amber-600",
      isLoading: eventsLoading,
    },
    {
      title: "Active Committees",
      value: committees?.length || 0,
      icon: Building2,
      href: "/admin/committees",
      colorClass: "text-purple-600 group-hover:text-purple-700",
      isLoading: commLoading,
    },
    {
      title: "Clubs",
      value: clubs?.length || 0,
      icon: Briefcase,
      href: "/admin/clubs",
      colorClass: "text-teal-600 group-hover:text-teal-700",
      isLoading: clubsLoading,
    },
    {
      title: "Alumni Network",
      value: alumni?.length || 0,
      icon: GraduationCap,
      href: "/admin/alumni",
      colorClass: "text-indigo-600 group-hover:text-indigo-700",
      isLoading: alumniLoading,
    },
    {
      title: "Total Messages",
      value: messages?.length || 0,
      icon: MessageSquare,
      href: "/admin/messages",
      colorClass: "text-rose-500 group-hover:text-rose-600",
      isLoading: msgLoading,
    },
  ];

  return (
    <AdminLayout title="Overview">
      <header className="mb-10" aria-label="Welcome section">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 font-heading">
          {greeting}, {user?.email?.split("@")[0]} 👋
        </h1>
        <time
          dateTime={new Date().toISOString()}
          className="text-sm text-slate-400"
        >
          {today}
        </time>
      </header>

      <section
        aria-labelledby="primary-focus-label"
        className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4"
      >
        <div className="flex items-center gap-3" aria-live="polite">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="primary-focus-label"
              className="font-bold text-orange-900 text-base"
            >
              Attention Required
            </h2>
            <p className="text-sm text-orange-700 max-w-md">
              {unreadMessages > 0 && (
                <>
                  You have <strong>{unreadMessages}</strong> unread{" "}
                  {unreadMessages === 1 ? "message" : "messages"}.
                </>
              )}
              {unreadMessages > 0 && upcomingEventsCount > 0 && <> Also, </>}
              {upcomingEventsCount > 0 && (
                <>
                  <strong>{upcomingEventsCount}</strong> upcoming{" "}
                  {upcomingEventsCount === 1 ? "event" : "events"} scheduled.
                </>
              )}
              {!unreadMessages && !upcomingEventsCount && (
                <>No immediate notifications at this time.</>
              )}
            </p>
          </div>
        </div>
        {(unreadMessages > 0 || upcomingEventsCount > 0) && (
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            {unreadMessages > 0 && (
              <Link
                to="/admin/messages"
                className="text-xs font-bold bg-white text-orange-600 px-4 py-2 rounded-lg border border-orange-100 hover:bg-orange-50 transition-colors shadow-sm text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
              >
                View Inbox
              </Link>
            )}
            {upcomingEventsCount > 0 && (
              <Link
                to="/admin/events"
                className="text-xs font-bold bg-white text-amber-600 px-4 py-2 rounded-lg border border-amber-100 hover:bg-amber-50 transition-colors shadow-sm text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
              >
                View Events
              </Link>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="stats-heading" className="mb-10">
        <h2
          id="stats-heading"
          className="font-heading text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            aria-hidden="true"
          ></span>
          Key Statistics
        </h2>
        <ul role="list" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <li key={stat.title}>
              <StatCard {...stat} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quick-actions-heading" className="mb-10">
        <h2
          id="quick-actions-heading"
          className="font-heading text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            aria-hidden="true"
          ></span>
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4" role="list">
          <ActionCard
            title="Add Member"
            desc="Update leadership team"
            icon={Users}
            href="/admin/team"
            delay={0.6}
          />
          <ActionCard
            title="New Event"
            desc="Schedule campus activity"
            icon={Calendar}
            href="/admin/events"
            delay={0.7}
          />
          <ActionCard
            title="Update Committee"
            desc="Edit committee details"
            icon={Building2}
            href="/admin/committees"
            delay={0.8}
          />
          <ActionCard
            title="Manage Alumni"
            desc="View past members"
            icon={GraduationCap}
            href="/admin/alumni"
            delay={0.9}
          />
        </div>
      </section>

      <section aria-labelledby="recent-activity-heading" className="mb-10">
        <h2
          id="recent-activity-heading"
          className="font-heading text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            aria-hidden="true"
          ></span>
          Recent Activity
        </h2>
        <article className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600 text-sm">
          {/* Placeholder content for recent activity */}
          <p>No recent activity to display.</p>
        </article>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
