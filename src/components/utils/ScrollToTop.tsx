import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Instant scroll to top
    window.scrollTo(0, 0);

    // 2. Prevent browser's default scroll restoration fighting us
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
