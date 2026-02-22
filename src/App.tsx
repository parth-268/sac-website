import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import ScrollToTop from "@/components/utils/ScrollToTop";
import { AppErrorBoundary } from "@/components/utils/AppErrorBoundary";
import OAuthCallback from "./contexts/OAuthCallback";
import PostAuth from "./contexts/PostAuth";

// Lazy Imports...
const Index = lazy(() => import("@/pages/public/Index"));
const Login = lazy(() => import("@/pages/public/Login"));
const ClubsPage = lazy(() => import("@/pages/public/ClubsPage"));
const CommitteesPage = lazy(() => import("@/pages/public/CommitteesPage"));
const AlumniPage = lazy(() => import("@/pages/public/AlumniPage"));
const EventsPage = lazy(() => import("@/pages/public/EventsPage"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

// Admin Imports...
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminTeam = lazy(() => import("@/pages/admin/Team"));
const AdminEvents = lazy(() => import("@/pages/admin/Events"));
const AdminCommittees = lazy(() => import("@/pages/admin/Committees"));
const AdminAbout = lazy(() => import("@/pages/admin/About"));
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminProfile = lazy(() => import("@/pages/admin/Profile"));
const AdminUsersDirectory = lazy(() => import("@/pages/admin/Users"));
const AdminClubs = lazy(() => import("@/pages/admin/Clubs"));
const AdminAlumni = lazy(() => import("@/pages/admin/Alumni"));
const AdminReports = lazy(() => import("@/pages/admin/Reports"));
const AdminHeroBanners = lazy(() => import("@/pages/admin/HeroBanners"));

// --- POLLING CONFIGURATION ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Poll only where explicitly needed
      refetchInterval: 1000 * 30, // 30s

      // Treat data as fresh for 30s (reduces refetch churn)
      staleTime: 1000 * 30,

      // Cache unused data for 5 minutes
      gcTime: 1000 * 60 * 5,

      // Avoid noisy retries
      retry: 1,

      // Refetch when user returns to tab
      refetchOnWindowFocus: true,

      // Avoid refetch on remount for static pages
      refetchOnMount: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-accent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
            <ScrollToTop />

            <AppErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* --- PUBLIC ROUTES --- */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/clubs" element={<ClubsPage />} />
                  <Route path="/committees" element={<CommitteesPage />} />
                  <Route path="/alumni" element={<AlumniPage />} />
                  <Route path="/events" element={<EventsPage />} />

                  {/* --- ADMIN ROUTES --- */}
                  <Route path="/admin">
                    <Route
                      index
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="team"
                      element={
                        <ProtectedRoute>
                          <AdminTeam />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="events"
                      element={
                        <ProtectedRoute>
                          <AdminEvents />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="committees"
                      element={
                        <ProtectedRoute>
                          <AdminCommittees />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="about"
                      element={
                        <ProtectedRoute>
                          <AdminAbout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="messages"
                      element={
                        <ProtectedRoute>
                          <AdminMessages />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <ProtectedRoute>
                          <AdminSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <AdminProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute>
                          <AdminUsersDirectory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="clubs"
                      element={
                        <ProtectedRoute>
                          <AdminClubs />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="alumni"
                      element={
                        <ProtectedRoute>
                          <AdminAlumni />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="reports"
                      element={
                        <ProtectedRoute>
                          <AdminReports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="hero-banners"
                      element={
                        <ProtectedRoute>
                          <AdminHeroBanners />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  <Route path="*" element={<NotFound />} />

                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/post-auth" element={<PostAuth />} />
                </Routes>
              </Suspense>
            </AppErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
