import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroCampus from "@/assets/hero-campus.png";

export const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroCampus})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-overlay-gradient" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "-3s" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/20 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-primary-foreground/90 text-sm font-body">
            Indian Institute of Management Sambalpur
          </span>
        </div>

        {/* Main Heading */}
        <h1
          className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Student Affairs
          <span className="block text-gradient-gold mt-2">Council</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-xl text-primary-foreground/80 font-body max-w-2xl mx-auto mb-10 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          The apex student body representing the voice of students, fostering
          leadership, and building a vibrant campus community at IIM Sambalpur.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Button variant="hero" size="xl" asChild>
            <a href="#about">Discover SAC</a>
          </Button>
          <Button variant="heroOutline" size="xl" asChild>
            <a href="#events">Upcoming Events</a>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#about"
        className="absolute bottom-8 text-primary-foreground/60 hover:text-primary-foreground transition-colors animate-bounce"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  );
};
