/* =============================================================
   CONTACT FORM HANDLER
   ============================================================= */
export const initContact = () => {
    const form = document.getElementById('portfolio-contact-form');
    if (!form) return;
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        if (!btn) return;

        const origText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Sending...';

        /* Simulated submission with UX state transitions */
        setTimeout(() => {
            btn.innerHTML = 'Message Sent ✓';
            form.reset();
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = origText;
            }, 3500);
        }, 1200);
    });
};
