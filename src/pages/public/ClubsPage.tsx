import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useClubs } from "@/hooks/useClubs";
import {
  Users,
  Instagram,
  Linkedin,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { icons } from "lucide-react";

const ClubsPage = () => {
  const { data: clubs, isLoading } = useClubs();

  const getIcon = (iconName: string) => {
    const Icon = icons[iconName as keyof typeof icons] as any;
    return Icon ? <Icon className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Clubs &"
        highlight="Contigents"
        description="Explore the student-led bodies that fuel passion and leadership."
        pattern="dots"
        variant="centered"
      />

      <section className="py-8 md:py-12">
        <div className="container-wide mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center h-40 items-center">
              <Loader2 className="animate-spin text-accent w-6 h-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs?.map((club, index) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:border-accent/40 hover:shadow-sm transition-all duration-300"
                >
                  {/* Compact Header */}
                  <div className="h-32 overflow-hidden relative bg-secondary">
                    {club.image_url ? (
                      <img
                        src={club.image_url}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <Users className="w-8 h-8" />
                      </div>
                    )}

                    <div className="absolute bottom-2 left-3 bg-background/95 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-border/50 text-accent">
                      {getIcon(club.icon)}
                    </div>

                    <div className="absolute top-2 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {club.member_count || "Active"}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-heading text-lg font-bold mb-1 text-foreground line-clamp-1">
                      {club.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {club.description}
                    </p>

                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {club.activities?.slice(0, 2).map((act: string) => (
                          <span
                            key={act}
                            className="text-[9px] font-medium bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {club.instagram_url && (
                          <a
                            href={club.instagram_url}
                            target="_blank"
                            className="text-muted-foreground hover:text-accent"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {club.linkedin_url && (
                          <a
                            href={club.linkedin_url}
                            target="_blank"
                            className="text-muted-foreground hover:text-accent"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default ClubsPage;
