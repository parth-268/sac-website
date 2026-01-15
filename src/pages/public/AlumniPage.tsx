import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAlumni } from "@/hooks/useAlumni";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Linkedin, GraduationCap, Users } from "lucide-react";

const AlumniPage = () => {
  const { data: alumni, isLoading } = useAlumni();
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");

  // Get unique batch years
  const batchYears = useMemo(() => {
    if (!alumni) return [];
    const years = [...new Set(alumni.map((a) => a.batch_year).filter(Boolean))];
    return years.sort().reverse();
  }, [alumni]);

  // Filter alumni based on search and batch
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

  // Group by batch year
  const groupedAlumni = useMemo(() => {
    const groups: Record<string, typeof filteredAlumni> = {};
    filteredAlumni.forEach((person) => {
      const year = person.batch_year || "Unknown";
      if (!groups[year]) groups[year] = [];
      groups[year].push(person);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredAlumni]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Alumni Directory
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg max-w-2xl mx-auto">
            Connect with past SAC members who have shaped the legacy of IIM
            Sambalpur
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batchYears.map((year) => (
                    <SelectItem key={year} value={year as string}>
                      Batch {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {filteredAlumni.length} alumni found
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : groupedAlumni.length > 0 ? (
            <div className="space-y-12">
              {groupedAlumni.map(([year, members]) => (
                <div key={year}>
                  <div className="flex items-center gap-3 mb-6">
                    <GraduationCap className="h-6 w-6 text-accent" />
                    <h2 className="font-heading text-2xl font-bold text-foreground">
                      Batch of {year}
                    </h2>
                    <Badge variant="secondary">{members.length} members</Badge>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {members.map((person) => (
                      <Card
                        key={person.id}
                        className="group hover:shadow-elevated transition-all"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-20 w-20 mb-4 ring-2 ring-accent/20">
                              <AvatarImage
                                src={person.image_url || undefined}
                                alt={person.name}
                              />
                              <AvatarFallback className="bg-accent/10 text-accent font-heading text-xl">
                                {person.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-heading font-semibold text-foreground">
                              {person.name}
                            </h3>
                            <p className="text-sm text-muted-foreground font-body mt-1">
                              {person.designation}
                            </p>
                            {person.linkedin_url && (
                              <a
                                href={person.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline"
                              >
                                <Linkedin className="h-4 w-4" />
                                Connect
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-body">
                {searchQuery || batchFilter !== "all"
                  ? "No alumni found matching your criteria"
                  : "No alumni in the directory yet"}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AlumniPage;
