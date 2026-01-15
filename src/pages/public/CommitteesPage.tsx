import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCommittees } from "@/hooks/useCommittees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, icons } from "lucide-react";

const CommitteesPage = () => {
  const { data: committees, isLoading } = useCommittees();

  const getIcon = (iconName: string) => {
    const Icon = icons[iconName as keyof typeof icons];
    return Icon ? (
      <Icon className="h-10 w-10" />
    ) : (
      <Building2 className="h-10 w-10" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Committees
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg max-w-2xl mx-auto">
            The backbone of SAC - dedicated committees working together to
            enhance campus life
          </p>
        </div>
      </section>

      {/* Committees Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {committees?.map((committee) => (
                <Card
                  key={committee.id}
                  className="group hover:shadow-elevated hover:border-accent/50 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="p-4 bg-accent/10 rounded-xl text-accent w-fit mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      {getIcon(committee.icon)}
                    </div>
                    <CardTitle className="font-heading text-xl">
                      {committee.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-body leading-relaxed">
                      {committee.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (!committees || committees.length === 0) && (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-body">
                No committees available yet
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CommitteesPage;
