import {
  Palette,
  Trophy,
  Briefcase,
  Users,
  BookOpen,
  Heart,
  Megaphone,
  Globe,
  Loader2,
  LayoutGrid,
} from "lucide-react";
import { useCommittees } from "@/hooks/useCommittees";

const iconMap: Record<string, React.ElementType> = {
  Palette,
  Trophy,
  Briefcase,
  Users,
  BookOpen,
  Heart,
  Megaphone,
  Globe,
};

const colorMap: Record<string, string> = {
  Palette: "bg-rose-500/10 text-rose-600",
  Trophy: "bg-emerald-500/10 text-emerald-600",
  Briefcase: "bg-blue-500/10 text-blue-600",
  Heart: "bg-pink-500/10 text-pink-600",
  BookOpen: "bg-amber-500/10 text-amber-600",
  Users: "bg-violet-500/10 text-violet-600",
  Megaphone: "bg-orange-500/10 text-orange-600",
  Globe: "bg-cyan-500/10 text-cyan-600",
};

export const Committees = () => {
  const { data: committees, isLoading } = useCommittees();

  return (
    <section id="committees" className="section-padding bg-secondary/50">
      <div className="container-wide mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm tracking-wider uppercase mb-4 font-body">
            Our Structure
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Committees & Clubs
          </h2>
          <p className="text-muted-foreground text-lg font-body leading-relaxed">
            SAC operates through dedicated committees, each focused on specific
            aspects of student life, ensuring comprehensive representation and
            engagement.
          </p>
        </div>

        {/* Committees Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : committees && committees.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {committees.map((committee, index) => {
              const IconComponent = iconMap[committee.icon] || Users;
              const colorClass =
                colorMap[committee.icon] || "bg-accent/10 text-accent";

              return (
                <div
                  key={committee.id}
                  className="group bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {committee.name}
                  </h3>
                  <p className="text-muted-foreground text-sm font-body leading-relaxed">
                    {committee.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No committees available</p>
          </div>
        )}
      </div>
    </section>
  );
};
