import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { useCommittees } from "@/hooks/useCommittees";
import { Building2, icons, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const CommitteesPage = () => {
  const { data: committees, isLoading } = useCommittees();

  const getIcon = (iconName: string) => {
    const Icon = icons[iconName as keyof typeof icons] as any;
    return Icon ? (
      <Icon className="h-5 w-5" />
    ) : (
      <Building2 className="h-5 w-5" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHero
        title="Academic"
        highlight="Committees"
        description="Ensuring academic excellence and seamless operations."
        pattern="dots"
      />

      <section className="py-8 md:py-12">
        <div className="container-wide mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees?.map((committee, index) => (
                <motion.div
                  key={committee.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-card p-5 rounded-xl border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground group-hover:bg-accent group-hover:text-white transition-colors shrink-0">
                      {getIcon(committee.icon)}
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold mb-1 group-hover:text-accent transition-colors">
                        {committee.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {committee.description}
                      </p>
                    </div>
                    <ChevronRight className="absolute right-4 top-6 w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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
export default CommitteesPage;
