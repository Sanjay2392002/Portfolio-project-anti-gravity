/**
 * Production-ready API configuration.
 *
 * If VITE_API_URL is configured (e.g. when backend is hosted separately on Render:
 * "https://sanjay-portfolio-api.onrender.com"), all client API requests will target that base URL.
 *
 * If VITE_API_URL is empty or omitted, relative URLs (e.g. "/api/...") are used,
 * which routes to same-origin (Vercel Serverless Function or Vite dev proxy).
 */
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export const getApiUrl = (endpoint: string): string => {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) return clean;
  return `${API_BASE_URL}${clean}`;
};

/**
 * Global fetch interceptor:
 * Automatically routes all /api, /uploads, and /selected-works calls to API_BASE_URL (if configured)
 * and ensures credentials: 'include' is present so authentication cookies are passed.
 */
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads') || input.startsWith('/selected-works')) {
        const fullUrl = getApiUrl(input);
        const options: RequestInit = {
          ...init,
          credentials: init?.credentials || 'include',
        };
        return originalFetch(fullUrl, options);
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api')) {
        const fullUrl = getApiUrl(input.pathname + input.search);
        const options: RequestInit = {
          ...init,
          credentials: init?.credentials || 'include',
        };
        return originalFetch(fullUrl, options);
      }
    }
    return originalFetch(input, init);
  };
}
