import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useAlumniMembers } from "@/hooks/useTeamData";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Linkedin, Loader2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const AlumniPage = () => {
  const { data: alumni, isLoading } = useAlumniMembers();

  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");

  const batchYears = useMemo(() => {
    if (!alumni) return [];
    return [...new Set(alumni.map((a) => a.batch_year).filter(Boolean))]
      .sort()
      .reverse();
  }, [alumni]);

  const filtered = useMemo(() => {
    if (!alumni) return [];
    return alumni.filter((a) => {
      const s = searchQuery.toLowerCase();
      return (
        (a.name.toLowerCase().includes(s) ||
          a.designation.toLowerCase().includes(s)) &&
        (batchFilter === "all" || a.batch_year === batchFilter)
      );
    });
  }, [alumni, searchQuery, batchFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((a) => {
      const key = a.batch_year || "Legacy";
      map[key] ??= [];
      map[key].push(a);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Legion of"
        highlight="Alumni"
        description="A legacy of leadership, impact, and excellence that continues beyond campus."
        variant="centered"
        pattern="dots"
      />

      <section className="relative py-8 md:py-12">
        <div className="container-wide mx-auto px-4">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-14 flex flex-col md:flex-row gap-4 items-center justify-between rounded-3xl border border-border bg-card/80 backdrop-blur px-6 py-4"
          >
            <div className="relative w-full md:w-96">
              <Search
                aria-hidden
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search alumni by name or role"
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-full md:w-52 bg-background">
                <SelectValue placeholder="Filter by batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batchYears.map((y) => (
                  <SelectItem key={y as string} value={y as string}>
                    Batch of {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-9 w-9 animate-spin text-accent" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground">
              No alumni match your search.
            </div>
          ) : (
            grouped.map(([batch, people]) => (
              <section key={batch} className="mb-16">
                {/* Batch Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="mb-8 flex items-center gap-6"
                >
                  <h2 className="text-3xl font-heading font-bold tracking-tight">
                    Batch of {batch}
                  </h2>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {people.length} Alumni
                  </span>
                </motion.div>

                {/* Alumni Grid */}
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-120px" }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {people.map((person) => (
                    <motion.article
                      key={person.id}
                      variants={item}
                      whileHover={{
                        y: -4,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 22,
                          mass: 0.6,
                        },
                      }}
                      className="relative overflow-hidden rounded-3xl border border-border bg-card p-4 will-change-transform"
                    >
                      {/* Accent glow */}
                      <motion.div
                        aria-hidden
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="pointer-events-none absolute inset-0"
                      />

                      <div className="flex items-start gap-4 relative z-10">
                        {/* Avatar */}
                        <Avatar className="h-14 w-14 border border-border bg-muted shrink-0">
                          <AvatarImage
                            src={person.image_url ?? undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="font-semibold text-sm text-muted-foreground">
                            {person.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Details */}
                        <div className="min-w-0 flex flex-col gap-1">
                          <h3 className="font-semibold text-base leading-tight truncate">
                            {person.name}
                          </h3>

                          <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                            {person.designation}
                          </p>

                          {person.linkedin_url && (
                            <a
                              href={person.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              <Linkedin aria-hidden className="h-4 w-4" />
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </section>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AlumniPage;
