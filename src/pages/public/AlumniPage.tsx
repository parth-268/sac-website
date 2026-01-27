import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useAlumniMembers } from "@/hooks/useTeamData"; // Updated Hook
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Linkedin, Loader2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const AlumniPage = () => {
  // 1. Fetch Data using new consolidated hook
  const { data: alumni, isLoading } = useAlumniMembers();

  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false); // Mobile toggle

  // 2. Extract Batches Dynamically
  const batchYears = useMemo(() => {
    if (!alumni) return [];
    // Get unique years and sort descending (newest first)
    const years = [...new Set(alumni.map((a) => a.batch_year).filter(Boolean))];
    return years.sort().reverse();
  }, [alumni]);

  // 3. Filter Logic
  const filteredAlumni = useMemo(() => {
    if (!alumni) return [];
    return alumni.filter((person) => {
      const matchesSearch =
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBatch =
        batchFilter === "all" || person.batch_year === batchFilter;
      return matchesSearch && matchesBatch;
    });
  }, [alumni, searchQuery, batchFilter]);

  // 4. Grouping Logic (By Batch)
  const groupedAlumni = useMemo(() => {
    const groups: Record<string, typeof filteredAlumni> = {};
    filteredAlumni.forEach((person) => {
      const year = person.batch_year || "Unknown";
      if (!groups[year]) groups[year] = [];
      groups[year].push(person);
    });
    // Sort groups by year descending
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredAlumni]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <PageHero
        title="Alumni"
        highlight="Network"
        description="Celebrating the legacy of our past council members."
        pattern="waves"
      />

      <section className="py-4 md:py-8 flex-1">
        <div className="container-wide mx-auto px-6">
          {/* --- Controls Bar --- */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-24 z-30">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alumni by name or role..."
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              className="md:hidden w-full flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" /> Filter by Batch
            </Button>

            {/* Batch Filter (Desktop + Mobile) */}
            <div
              className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-48`}
            >
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Filter by Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batchYears.map((year) => (
                    <SelectItem key={year as string} value={year as string}>
                      Batch of {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- Results Area --- */}
          <div className="space-y-12">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : groupedAlumni.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p>No alumni found matching your criteria.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setBatchFilter("all");
                  }}
                  className="mt-2 text-accent"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              groupedAlumni.map(([batch, people]) => (
                <div key={batch} className="scroll-mt-28">
                  {/* Batch Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-2xl font-heading font-bold text-slate-800">
                      Batch of {batch}
                    </h3>
                    <div className="h-[1px] flex-1 bg-slate-100" />
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      {people.length} Members
                    </span>
                  </div>

                  {/* Members Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {people.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-accent/30 hover:shadow-md transition-all duration-300 group"
                      >
                        <Avatar className="h-12 w-12 border border-slate-100 bg-slate-50 mt-1">
                          <AvatarImage
                            src={person.image_url ?? undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs font-bold text-slate-400">
                            {person.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-accent transition-colors">
                            {person.name}
                          </h4>
                          <p className="text-[10px] uppercase font-bold text-slate-500 truncate mb-2">
                            {person.designation}
                          </p>

                          {/* LinkedIn Display */}
                          {person.linkedin_url && (
                            <a
                              href={person.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                              <Linkedin className="w-3 h-3" />
                              Connect
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AlumniPage;
