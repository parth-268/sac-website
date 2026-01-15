import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, isEditor } = useAuth();

  return (
    <footer className="bg-foreground py-12">
      <div className="container-wide mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="mb-4">
              <div className="font-heading font-bold text-2xl text-background">
                SAC
              </div>
              <div className="text-xs font-body text-background/60">
                IIM Sambalpur
              </div>
            </div>
            <p className="text-background/70 text-sm font-body leading-relaxed">
              Student Affairs Council - The apex student body representing and
              serving the student community of IIM Sambalpur.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["About", "Committees", "Team", "Events", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-background/70 hover:text-accent text-sm font-body transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Institute Links */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-4">
              Institute
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://iimsambalpur.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-accent text-sm font-body transition-colors"
                >
                  IIM Sambalpur Official
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-accent text-sm font-body transition-colors"
                >
                  Student Portal
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-accent text-sm font-body transition-colors"
                >
                  Placements
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-accent text-sm font-body transition-colors"
                >
                  Alumni Network
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-background/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/50 text-sm font-body">
              © {currentYear} Student Affairs Council, IIM Sambalpur. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-background/50 hover:text-accent text-sm font-body transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-background/50 hover:text-accent text-sm font-body transition-colors"
              >
                Terms of Use
              </a>
              {/* Admin Login Link */}
              {user && isEditor ? (
                <Link
                  to="/admin"
                  className="text-accent hover:text-accent/80 text-sm font-body transition-colors flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Admin Panel
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-background/50 hover:text-accent text-sm font-body transition-colors flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
