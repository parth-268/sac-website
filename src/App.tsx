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
import ScrollToTop from "@/components/utils/ScrollToTop"; // Import ScrollToTop

// Lazy Load Public Pages
const Index = lazy(() => import("@/pages/public/Index"));
const Login = lazy(() => import("@/pages/public/Login"));
const ClubsPage = lazy(() => import("@/pages/public/ClubsPage"));
const CommitteesPage = lazy(() => import("@/pages/public/CommitteesPage"));
const AlumniPage = lazy(() => import("@/pages/public/AlumniPage"));
const EventsPage = lazy(() => import("@/pages/public/EventsPage"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

// Lazy Load Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminTeam = lazy(() => import("@/pages/admin/Team"));
const AdminEvents = lazy(() => import("@/pages/admin/Events"));
const AdminCommittees = lazy(() => import("@/pages/admin/Committees"));
const AdminAbout = lazy(() => import("@/pages/admin/About")); // Fixed import name based on previous steps
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminClubs = lazy(() => import("@/pages/admin/Clubs"));
const AdminAlumni = lazy(() => import("@/pages/admin/Alumni"));
const AdminReports = lazy(() => import("@/pages/admin/Reports"));
const AdminHeroBanners = lazy(() => import("@/pages/admin/HeroBanners"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
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
            {/* 1. SCROLL FIXER (Must be inside BrowserRouter) */}
            <ScrollToTop />

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
                {/* We wrap individual pages to keep the layout logic simple for now */}
                <Route path="/admin">
                  <Route
                    index
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="team"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminTeam />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="events"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminEvents />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="committees"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminCommittees />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="about"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminAbout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="messages"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminMessages />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="clubs"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminClubs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="alumni"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminAlumni />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminReports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="hero-banners"
                    element={
                      <ProtectedRoute requireEditor>
                        <AdminHeroBanners />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* --- 404 --- */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
