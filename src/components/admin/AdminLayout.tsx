import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  GraduationCap,
  Globe,
  Image as ImageIcon,
  Search,
  Bell,
  Home, // Import Home Icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Hero Banners", href: "/admin/hero-banners", icon: ImageIcon },
    ],
  },
  {
    title: "Content & Activity",
    items: [
      { name: "Events", href: "/admin/events", icon: Calendar },
      { name: "Messages", href: "/admin/messages", icon: MessageSquare },
      { name: "Reports", href: "/admin/reports", icon: FileText },
    ],
  },
  {
    title: "Organization",
    items: [
      { name: "Team", href: "/admin/team", icon: Users },
      { name: "Committees", href: "/admin/committees", icon: Building2 },
      { name: "Clubs", href: "/admin/clubs", icon: Building2 },
      { name: "Alumni", href: "/admin/alumni", icon: GraduationCap },
    ],
  },
  {
    title: "System",
    items: [
      { name: "About Page", href: "/admin/about", icon: FileText },
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Profile", href: "/admin/profile", icon: Globe },
      { name: "User Directory", href: "/admin/users", icon: Users }
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const AdminLayout = ({
  children,
  title,
  description,
  actions,
}: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-slate-900 leading-none block">
                SAC Admin
              </span>
              <span className="text-[10px] text-slate-500 font-medium group-hover:text-accent transition-colors">
                Back to Website
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-slate-100 text-accent"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-accent" : "text-slate-400",
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">
                {user?.email}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                Administrator
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR (Drawer) --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <span className="font-heading font-bold text-lg">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* NEW: Explicit Back to Website Link in Drawer */}
              <div className="px-4 pt-4 pb-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 font-medium text-sm hover:bg-slate-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Home className="h-4 w-4 text-accent" />
                  Back to Website
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto py-2 px-4 space-y-6">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="px-2 text-xs font-bold text-slate-400 mb-2">
                      {group.title}
                    </h3>
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                          location.pathname === item.href
                            ? "bg-accent/10 text-accent"
                            : "text-slate-600",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* NEW: Home Icon Button on Mobile Header */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-500"
              onClick={() => navigate("/")}
              aria-label="Go Home"
            >
              <Home className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center text-sm text-slate-500 bg-slate-100 rounded-md px-3 py-1.5 w-64">
              <Search className="w-4 h-4 mr-2 opacity-50" />
              <span>Search...</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-700"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <div className="text-right sm:block">
              <p className="text-xs font-bold text-slate-700">Admin Portal</p>
              <p className="text-[10px] text-slate-400">v1.0.0</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-slate-500 mt-1 text-sm lg:text-base">
                  {description}
                </p>
              )}
            </div>

            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
