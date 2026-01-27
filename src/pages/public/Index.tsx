import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Team } from "@/components/sections/Team";
import { Events } from "@/components/sections/Events";
import { Contact } from "@/components/sections/Contact";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-accent selection:text-white">
      <SEO
        title="Home"
        description="Official Student Affairs Council (SAC) of IIM Sambalpur. Discover our clubs, committees, events, and student leadership."
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Team />
        <Events />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
