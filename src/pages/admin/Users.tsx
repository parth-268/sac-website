import { useState, useMemo, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useUserDirectory } from "@/hooks/useUserDirectory";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  CalendarClock,
  ChevronRight,
  Users,
  UserCog,
  Link2,
  Link2Off,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
};

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <Card className="border-slate-100 shadow-sm">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${color} bg-opacity-10`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

export default function AdminUsersDirectory() {
  const { data: users, isLoading } = useUserDirectory();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const goToTeam = useCallback(() => navigate("/admin/team"), [navigate]);

  // --- Logic ---
  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, team: 0 };
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      team: users.filter((u) => u.is_team_member).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "admin"
            ? user.role === "admin"
            : filter === "team"
              ? user.is_team_member
              : true;
      const q = search.trim().toLowerCase();
      if (!q) return matchesFilter;

      const matchesSearch =
        user.email?.toLowerCase().includes(q) ||
        user.full_name?.toLowerCase().includes(q);
      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  if (isLoading)
    return (
      <AdminLayout title="User Directory">
        <Loader2 className="animate-spin mx-auto mt-10 h-8 w-8 text-slate-400" />
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="User Directory"
      description="Manage user accounts and access."
    >
      {/* 1. Mobile-Friendly Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={ShieldAlert}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Team Members"
          value={stats.team}
          icon={UserCog}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* 2. Responsive Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-6 bg-white p-1 md:p-0 rounded-lg md:bg-transparent">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            className="pl-10 bg-white border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="all"
          value={filter}
          onValueChange={setFilter}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 3. List View (Responsive) */}
      <div className="space-y-3" role="list">
        {filteredUsers.map((user) => (
          <div
            key={user.user_id}
            role="listitem"
            className="group relative bg-white rounded-xl border border-slate-200 p-4 transition-all hover:border-purple-200 hover:shadow-sm cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Top Row (Mobile): Avatar + Name + Action */}
              <div className="flex items-start justify-between w-full md:w-auto md:min-w-[30%]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar className="h-10 w-10 border border-slate-100 shrink-0">
                    <AvatarFallback
                      className={`text-xs font-bold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {user.full_name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-900 truncate text-sm md:text-base">
                      {user.full_name || "Unknown"}
                    </span>
                    <span className="text-xs text-slate-500 truncate font-mono">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Mobile-Only Action Button (Top Right) */}
                {user.is_team_member && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Go to team management"
                    className="md:hidden h-8 w-8 -mr-2 text-slate-400"
                    onClick={goToTeam}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Middle Row (Mobile): Status Badges */}
              <div className="flex flex-wrap items-center gap-2 md:flex-1">
                {/* Role Badge */}
                {user.role === "admin" ? (
                  <Badge
                    variant="outline"
                    className="border-purple-200 bg-purple-50 text-purple-700 gap-1 text-[10px] md:text-xs"
                  >
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-500 gap-1 text-[10px] md:text-xs"
                  >
                    <UserIcon className="w-3 h-3" /> User
                  </Badge>
                )}

                {/* Connection Badge */}
                {user.is_team_member ? (
                  <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <Link2 className="w-3 h-3" /> Linked
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                    <Link2Off className="w-3 h-3" /> Unlinked
                  </div>
                )}
              </div>

              {/* Bottom Row (Mobile): Last Login */}
              <div className="flex items-center justify-between md:justify-end md:w-[25%] mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
                <div
                  className="flex items-center gap-1.5 text-xs text-slate-400"
                  title={user.last_sign_in_at || ""}
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  {user.last_sign_in_at ? (
                    <span>
                      {formatDistanceToNow(new Date(user.last_sign_in_at), {
                        addSuffix: true,
                      })}
                    </span>
                  ) : (
                    <span>Never logged in</span>
                  )}
                </div>

                {/* Desktop Action Button */}
                {user.is_team_member && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Go to team management"
                    className="hidden md:flex h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                    onClick={goToTeam}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="bg-slate-50 p-3 rounded-full w-fit mx-auto mb-3">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-medium">No users found</h3>
            <p className="text-slate-500 text-sm mt-1">
              Try a different search term.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
