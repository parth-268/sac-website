import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Team } from "@/components/sections/Team";
import { Events } from "@/components/sections/Events";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Home"
        description="Welcome to the Students' Affairs Council of IIM Sambalpur. Discover our clubs, committees, and campus events."
      />
      <Navbar />
      <Hero />
      <About />
      <Team />
      <Events />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
