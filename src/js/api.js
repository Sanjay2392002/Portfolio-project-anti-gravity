/* =============================================================
   API HELPERS
   ============================================================= */
export const api = (endpoint) => {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocal) return endpoint;
    const base = (localStorage.getItem('production_api_url') || '').replace(/\/$/, '');
    return `${base}${endpoint}`;
};

export const apiFetch = async (endpoint, opts = {}) => {
    const res = await fetch(api(endpoint), opts);
    if (!res.ok) throw new Error(`API ${endpoint} → ${res.status}`);
    return res.json();
};
