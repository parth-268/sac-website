import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Team } from "@/components/sections/Team";
import { Events } from "@/components/sections/Events";
import { Contact } from "@/components/sections/Contact";
import { SEO } from "@/components/SEO";
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

const Index = () => {
  const location = useLocation();
  const hasHandledScrollRef = useRef(false);

  useEffect(() => {
    hasHandledScrollRef.current = false;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    const scrollWithOffset = (element: Element) => {
      const navbar = document.querySelector("nav");
      const offset = navbar?.getBoundingClientRect().height ?? 0;

      const elementTop =
        element.getBoundingClientRect().top + window.pageYOffset;

      const targetScroll = elementTop - offset;

      if (Math.abs(window.scrollY - targetScroll) < 4) return;

      window.scrollTo({
        top: targetScroll,
        behavior,
      });
    };

    // Case 1: Hash exists on HOME route → scroll to section
    if (location.pathname === "/" && location.hash) {
      if (hasHandledScrollRef.current) return;
      hasHandledScrollRef.current = true;

      const targetId = location.hash;
      const element = document.querySelector(targetId);

      if (element) {
        scrollWithOffset(element);
      } else {
        requestAnimationFrame(() => {
          const retryElement = document.querySelector(targetId);
          if (retryElement) {
            scrollWithOffset(retryElement);
          }
        });
      }
    }

    // Case 2: Navigated from another route with hash meant for home
    else if (location.pathname !== "/" && location.hash) {
      if (hasHandledScrollRef.current) return;
      hasHandledScrollRef.current = true;

      window.history.replaceState(null, "", `/${location.hash}`);
    }

    // Case 3: Plain home navigation → scroll to top
    else if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior });
    }
  }, [location.pathname, location.hash]);

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
