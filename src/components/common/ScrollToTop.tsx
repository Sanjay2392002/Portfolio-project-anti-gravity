import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Prevent browser from overriding programmatic scroll with cached positions
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

/**
 * Universal scroll reset on page transition:
 * 1. Resets scroll to top (0, 0) immediately before paint on any route change.
 * 2. Overcomes CSS `scroll-behavior: smooth` so route transitions snap instantly to top without lagging.
 * 3. Double-checks with requestAnimationFrame and post-mount timeout in case of Suspense/lazy loading rendering delay.
 * 4. Resets scroll position when leaving a page.
 * 5. Smoothly scrolls to in-page hash targets (e.g. #about, #contact) when a hash is explicitly requested.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  const prevPathRef = useRef(pathname);

  const resetToTop = () => {
    const html = document.documentElement;
    const body = document.body;
    const originalBehavior = html.style.scrollBehavior;

    // Temporarily disable smooth scrolling so reset to top is immediate
    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0);
    html.scrollTop = 0;
    body.scrollTop = 0;

    requestAnimationFrame(() => {
      html.style.scrollBehavior = originalBehavior;
      body.style.scrollBehavior = '';
    });
  };

  // Immediate layout effect before paint
  useLayoutEffect(() => {
    if (!hash) {
      resetToTop();
    }
  }, [pathname, search, hash]);

  // Secondary effect to guarantee reset after lazy-loaded components mount
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
      resetToTop();
      // Extra tick in case Suspense/lazy-loaded chunk takes a few frames to paint
      const timer = setTimeout(resetToTop, 60);
      return () => clearTimeout(timer);
    }

    prevPathRef.current = pathname;

    // Cleanup: reset scroll when leaving the current page
    return () => {
      resetToTop();
    };
  }, [pathname, search, hash]);

  return null;
};
