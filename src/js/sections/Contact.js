import { api } from '../api.js';

export const initContact = () => {
    const form = document.getElementById('portfolio-contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        if (!btn) return;

        const origText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Sending...';

        const formData = new FormData(form);
        const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            category: formData.get('category') || '',
            message: formData.get('message')
        };

        try {
            const res = await fetch(api('/api/contact'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('Failed to send');

            btn.innerHTML = 'Message Sent ✓';
            form.reset();
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = origText;
            }, 3500);
        } catch (err) {
            console.error('Contact submission error:', err);
            btn.innerHTML = 'Error! Try Again';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = origText;
            }, 3500);
        }
    });
};
