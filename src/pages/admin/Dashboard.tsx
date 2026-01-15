import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useEvents } from "@/hooks/useEvents";
import { useCommittees } from "@/hooks/useCommittees";
import { useContactSubmissions } from "@/hooks/useContactInfo";
import { useClubs } from "@/hooks/useClubs";
import { useAlumni } from "@/hooks/useAlumni";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Building2,
  MessageSquare,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: teamMembers } = useTeamMembers();
  const { data: events } = useEvents();
  const { data: committees } = useCommittees();
  const { data: messages } = useContactSubmissions();
  const { data: clubs } = useClubs();
  const { data: alumni } = useAlumni();

  const unreadMessages = messages?.filter((m) => !m.is_read).length || 0;

  const stats = [
    {
      title: "Team Members",
      value: teamMembers?.length || 0,
      icon: Users,
      href: "/admin/team",
      color: "text-blue-500",
    },
    {
      title: "Events",
      value: events?.length || 0,
      icon: Calendar,
      href: "/admin/events",
      color: "text-green-500",
    },
    {
      title: "Committees",
      value: committees?.length || 0,
      icon: Building2,
      href: "/admin/committees",
      color: "text-purple-500",
    },
    {
      title: "Clubs",
      value: clubs?.length || 0,
      icon: Briefcase,
      href: "/admin/clubs",
      color: "text-teal-500",
    },
    {
      title: "Alumni",
      value: alumni?.length || 0,
      icon: GraduationCap,
      href: "/admin/alumni",
      color: "text-amber-500",
    },
    {
      title: "Unread Messages",
      value: unreadMessages,
      icon: MessageSquare,
      href: "/admin/messages",
      color: "text-orange-500",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-elevated transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-heading">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-xl font-semibold mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/admin/team"
            className="p-4 bg-card rounded-lg border border-border hover:border-accent transition-colors"
          >
            <h3 className="font-medium text-foreground mb-1">
              Add Team Member
            </h3>
            <p className="text-sm text-muted-foreground">
              Add new SAC council members
            </p>
          </Link>
          <Link
            to="/admin/events"
            className="p-4 bg-card rounded-lg border border-border hover:border-accent transition-colors"
          >
            <h3 className="font-medium text-foreground mb-1">Create Event</h3>
            <p className="text-sm text-muted-foreground">
              Schedule new campus events
            </p>
          </Link>
          <Link
            to="/admin/committees"
            className="p-4 bg-card rounded-lg border border-border hover:border-accent transition-colors"
          >
            <h3 className="font-medium text-foreground mb-1">
              Manage Committees
            </h3>
            <p className="text-sm text-muted-foreground">
              Update committee information
            </p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
