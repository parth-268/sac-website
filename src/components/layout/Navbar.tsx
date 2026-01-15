import { useState, useEffect } from "react";
import { Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Clubs", href: "/clubs" },
  { name: "Committees", href: "/committees" },
  { name: "Events", href: "/events" },
  { name: "Alumni", href: "/alumni" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isEditor } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container-wide mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className={`transition-all duration-300 ${scrolled ? "text-primary" : "text-primary-foreground"}`}
            >
              <div className="font-heading font-bold text-xl md:text-2xl">
                SAC
              </div>
              <div className="text-[10px] md:text-xs font-body tracking-wide opacity-80">
                IIM Sambalpur
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 text-sm font-medium font-body transition-colors rounded-md ${
                  scrolled
                    ? "text-foreground hover:text-accent hover:bg-accent/10"
                    : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Admin Link for Editors */}
            {user && isEditor && (
              <Link
                to="/admin"
                className={`px-4 py-2 text-sm font-medium font-body transition-colors rounded-md flex items-center gap-2 ${
                  scrolled
                    ? "text-accent hover:bg-accent/10"
                    : "text-accent hover:bg-primary-foreground/10"
                }`}
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card shadow-lg animate-fade-in">
            <div className="flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-6 py-3 text-foreground hover:text-accent hover:bg-accent/5 font-body transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Admin Link for Editors (Mobile) */}
              {user && isEditor && (
                <Link
                  to="/admin"
                  className="px-6 py-3 text-accent hover:bg-accent/5 font-body transition-colors flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
