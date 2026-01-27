import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTeamMembers, useAlumniMembers } from "@/hooks/useTeamData"; // Updated Hook Import
import { useEvents } from "@/hooks/useEvents";
import { useCommittees } from "@/hooks/useCommittees";
import { useContactSubmissions } from "@/hooks/useContactInfo";
import { useClubs } from "@/hooks/useClubs";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Calendar,
  Building2,
  MessageSquare,
  GraduationCap,
  Briefcase,
  ArrowUpRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Components ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  href,
  colorClass,
  delay,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Link to={href} className="block h-full">
      <div className="group h-full bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/40 hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div
            className={cn(
              "p-3 rounded-xl bg-slate-50 transition-colors group-hover:bg-accent/10",
              colorClass,
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-accent group-hover:text-white transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1 font-heading">
            {value}
          </h3>
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>

        {/* Decorative Background Blob */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 group-hover:bg-accent/5 transition-all duration-500 -z-0 pointer-events-none" />
      </div>
    </Link>
  </motion.div>
);

const ActionCard = ({ title, desc, href, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Link
      to={href}
      className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-accent/50 hover:bg-slate-50/50 transition-all group"
    >
      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-accent group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm group-hover:text-accent transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </Link>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();

  // Use new hooks from useTeamData
  const { data: teamMembers } = useTeamMembers();
  const { data: alumni } = useAlumniMembers(); // Updated from useAlumni()

  const { data: events } = useEvents();
  const { data: committees } = useCommittees();
  const { data: messages } = useContactSubmissions();
  const { data: clubs } = useClubs();

  const unreadMessages = messages?.filter((m) => !m.is_read).length || 0;

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
    },
    {
      title: "Upcoming Events",
      value: events?.length || 0,
      icon: Calendar,
      href: "/admin/events",
      colorClass: "text-amber-500 group-hover:text-amber-600",
    },
    {
      title: "Active Committees",
      value: committees?.length || 0,
      icon: Building2,
      href: "/admin/committees",
      colorClass: "text-purple-600 group-hover:text-purple-700",
    },
    {
      title: "Clubs",
      value: clubs?.length || 0,
      icon: Briefcase,
      href: "/admin/clubs",
      colorClass: "text-teal-600 group-hover:text-teal-700",
    },
    {
      title: "Alumni Network",
      value: alumni?.length || 0,
      icon: GraduationCap,
      href: "/admin/alumni",
      colorClass: "text-indigo-600 group-hover:text-indigo-700",
    },
    {
      title: "Total Messages",
      value: messages?.length || 0,
      icon: MessageSquare,
      href: "/admin/messages",
      colorClass: "text-rose-500 group-hover:text-rose-600",
    },
  ];

  return (
    <AdminLayout title="Overview">
      {/* --- Welcome Section --- */}
      <div className="mb-10">
        <h2 className="text-xl text-slate-500 font-medium mb-1">
          Welcome back, {user?.email?.split("@")[0]} 👋
        </h2>
        <p className="text-sm text-slate-400">{today}</p>
      </div>

      {/* --- Needs Attention Banner --- */}
      {unreadMessages > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-orange-900 text-sm">
                You have {unreadMessages} unread messages
              </h3>
              <p className="text-xs text-orange-700">
                Check the inbox to respond to inquiries.
              </p>
            </div>
          </div>
          <Link
            to="/admin/messages"
            className="text-xs font-bold bg-white text-orange-600 px-4 py-2 rounded-lg border border-orange-100 hover:bg-orange-50 transition-colors shadow-sm"
          >
            View Inbox
          </Link>
        </motion.div>
      )}

      {/* --- Stats Grid --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* --- Quick Actions --- */}
      <div>
        <h2 className="font-heading text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
