import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useClubs } from "@/hooks/useClubs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { icons } from "lucide-react";

const ClubsPage = () => {
  const { data: clubs, isLoading } = useClubs();

  const getIcon = (iconName: string) => {
    const Icon = icons[iconName as keyof typeof icons];
    return Icon ? <Icon className="h-8 w-8" /> : <Users className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Clubs & Contingents
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg max-w-2xl mx-auto">
            Explore the vibrant clubs and contingents that make IIM Sambalpur's
            campus life exceptional
          </p>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {clubs?.map((club) => (
                <Card
                  key={club.id}
                  className="group hover:shadow-elevated transition-all duration-300 overflow-hidden"
                >
                  {club.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={club.image_url}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-accent/10 rounded-lg text-accent mb-2">
                        {getIcon(club.icon)}
                      </div>
                      {club.member_count && club.member_count > 0 && (
                        <Badge variant="secondary">
                          {club.member_count} members
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-heading text-xl">
                      {club.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground font-body text-sm line-clamp-3">
                      {club.description}
                    </p>

                    {/* Club Head */}
                    {club.head_name && (
                      <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-1">
                          Club Head
                        </p>
                        <p className="font-medium text-foreground">
                          {club.head_name}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {club.head_email && (
                            <a
                              href={`mailto:${club.head_email}`}
                              className="text-muted-foreground hover:text-accent"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {club.head_phone && (
                            <a
                              href={`tel:${club.head_phone}`}
                              className="text-muted-foreground hover:text-accent"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {club.activities && club.activities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {club.activities.slice(0, 3).map((activity, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-3 pt-2">
                      {club.instagram_url && (
                        <a
                          href={club.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-pink-500 transition-colors"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {club.linkedin_url && (
                        <a
                          href={club.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-blue-600 transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (!clubs || clubs.length === 0) && (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-body">
                No clubs available yet
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ClubsPage;
