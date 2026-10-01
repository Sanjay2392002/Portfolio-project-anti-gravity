import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Handles automatic scroll restoration across routes and smooth scrolling
 * for internal anchor/hash targets (e.g. #about, #contact, #brand-topic-*).
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const scrollTarget = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollTarget()) {
        const timer = setTimeout(scrollTarget, 100);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};
