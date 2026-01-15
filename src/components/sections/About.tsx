import { Target, Users, Award, Lightbulb, Loader2 } from "lucide-react";
import { useAboutContent, useAboutStats } from "@/hooks/useAboutContent";

const iconMap: Record<string, React.ElementType> = {
  Users,
  Target,
  Award,
  Lightbulb,
};

const defaultFeatures = [
  {
    icon: Users,
    title: "Student Representation",
    description:
      "Voicing student concerns and ensuring their needs are addressed at all institutional levels.",
  },
  {
    icon: Target,
    title: "Policy Formulation",
    description:
      "Crafting policies for non-academic student affairs that shape campus life.",
  },
  {
    icon: Award,
    title: "Event Management",
    description:
      "Organizing flagship events, cultural fests, and inter-college competitions.",
  },
  {
    icon: Lightbulb,
    title: "Student Welfare",
    description:
      "Addressing student problems through institutional frameworks and support systems.",
  },
];

export const About = () => {
  const { data: aboutContent, isLoading: contentLoading } = useAboutContent();
  const { data: aboutStats, isLoading: statsLoading } = useAboutStats();

  const isLoading = contentLoading || statsLoading;

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-wide mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm tracking-wider uppercase mb-4 font-body">
            About Us
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {aboutContent?.title || "Empowering Student Voice"}
          </h2>
          <p className="text-muted-foreground text-lg font-body leading-relaxed">
            {aboutContent?.description ||
              "The Student Affairs Council (SAC) is the apex student body of IIM Sambalpur, dedicated to representing student interests, organizing campus activities, and fostering a vibrant academic community."}
          </p>
        </div>

        {/* Vision & Mission */}
        {(aboutContent?.vision || aboutContent?.mission) && (
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {aboutContent?.vision && (
              <div className="p-6 bg-card rounded-xl shadow-card">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  Our Vision
                </h3>
                <p className="text-muted-foreground font-body">
                  {aboutContent.vision}
                </p>
              </div>
            )}
            {aboutContent?.mission && (
              <div className="p-6 bg-card rounded-xl shadow-card">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  Our Mission
                </h3>
                <p className="text-muted-foreground font-body">
                  {aboutContent.mission}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-xl shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                <feature.icon className="h-6 w-6 text-accent group-hover:text-accent-foreground transition-colors" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : aboutStats && aboutStats.length > 0 ? (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-primary rounded-2xl">
            {aboutStats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/80 text-sm font-body">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-primary rounded-2xl">
            {[
              { value: "500+", label: "Students" },
              { value: "15+", label: "Committees" },
              { value: "50+", label: "Events/Year" },
              { value: "100%", label: "Student Engagement" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/80 text-sm font-body">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
