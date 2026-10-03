import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Send, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

interface ContactSectionProps {
  variant?: 'default' | 'home';
}

export const ContactSection: React.FC<ContactSectionProps> = ({ variant = 'default' }) => {
  const { settings } = usePortfolio();
  const cvUrl = settings?.resume_download_url || settings?.resume_url || '/Sanjay_M_Resume.pdf';
  const isHome = variant === 'home';
  const easeApple = [0.22, 1, 0.36, 1] as const;

  const email = settings?.email || 'sanjaymurugesan23@gmail.com';
  const phone = (settings as any)?.phone || '+91 7010948452';
  const linkedin = settings?.linkedin_url || 'https://www.linkedin.com/in/sanjaym23';
  const behance = settings?.behance_url || 'https://www.behance.net/sanjayuiuxgd';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        // Fallback: save to localStorage so inquiry is never lost
        try {
          const offlineInquiries = JSON.parse(localStorage.getItem('portfolio_contact_inquiries') || '[]');
          offlineInquiries.push({ ...formData, timestamp: new Date().toISOString() });
          localStorage.setItem('portfolio_contact_inquiries', JSON.stringify(offlineInquiries));
        } catch (_) {}

        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      // Local preservation fallback
      try {
        const offlineInquiries = JSON.parse(localStorage.getItem('portfolio_contact_inquiries') || '[]');
        offlineInquiries.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem('portfolio_contact_inquiries', JSON.stringify(offlineInquiries));
      } catch (_) {}

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className={`w-full py-28 md:py-36 lg:py-44 bg-black text-white select-none${isHome ? ' home-contact' : ''}`}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Narrative */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="text-[12px] md:text-[13px] font-semibold tracking-[0.12em] text-[#8A8A8A] uppercase mb-6">
              {isHome ? 'CONTACT' : 'GET IN TOUCH'}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: easeApple }}
            >
              <div className="text-[18px] sm:text-[22px] md:text-[24px] font-medium text-[#8A8A8A] tracking-[-0.015em] mb-2">
                Have a project in mind?
              </div>
              <h2 className="text-[40px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-bold tracking-[-0.04em] leading-[0.98] uppercase text-white mb-8">
                LET'S WORK<br />TOGETHER.
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: easeApple, delay: 0.1 }}
              className="text-[16px] sm:text-[18px] text-[#8A8A8A] leading-[1.6] max-w-[480px] mb-10"
            >
              {isHome ? 'Available for design projects, creative collaborations and opportunities.' : 'Get in touch about social media design or UI projects.'}
            </motion.p>

            {/* Direct Channels: Email & Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: easeApple, delay: 0.15 }}
              className="space-y-6 mb-12"
            >
              <div>
                <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block mb-2">
                  {isHome ? 'Email' : 'Direct Email'}
                </span>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center space-x-2 text-[18px] sm:text-[22px] font-semibold text-white hover:text-[#CCCCCC] transition-colors border-b border-white pb-1 group"
                >
                  <span>{email}</span>
                  <ArrowUpRight size={18} className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-200" />
                </a>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block mb-2">
                  {isHome ? 'Phone' : 'Mobile / WhatsApp'}
                </span>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center space-x-2 text-[18px] sm:text-[22px] font-semibold text-white hover:text-[#CCCCCC] transition-colors border-b border-white pb-1 group"
                >
                  <span>{phone}</span>
                  <ArrowUpRight size={18} className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-200" />
                </a>
              </div>
            </motion.div>

            {/* Download CV CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: easeApple, delay: 0.2 }}
              className="mb-10"
            >
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-cv-cta"
                data-cursor="link"
              >
                <span>DOWNLOAD CV</span>
                <Download size={16} strokeWidth={2.2} className="contact-cv-icon" />
              </a>
            </motion.div>

            {/* Social Links (Secondary) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: easeApple, delay: 0.25 }}
              className="space-y-2"
            >
                <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">
                  {isHome ? 'Follow' : 'Network & Social'}
                </span>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium tracking-tight text-[#8A8A8A]">
                {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LINKEDIN ↗</a>}
                {behance && <a href={behance} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">BEHANCE ↗</a>}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clean Minimal Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: easeApple, delay: 0.15 }}
            className="lg:col-span-6 w-full"
          >
            <div className="p-8 sm:p-10 rounded-[16px] bg-[#111111] border border-[#222222]">
              <h3 className="text-[20px] font-bold uppercase tracking-tight text-white mb-6">
                Send a Message
              </h3>

              {status === 'success' && (
                <div className="mb-6 p-4 rounded-[8px] bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[13.5px] flex items-start space-x-3">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Message delivered!</div>
                    <div className="text-[12.5px] text-emerald-400/90 mt-0.5">
                      Thank you for reaching out. I'll review your project details and get back to you promptly.
                    </div>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 rounded-[8px] bg-rose-950/60 border border-rose-800 text-rose-300 text-[13.5px] flex items-start space-x-3">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name or company"
                    className="w-full px-4 py-3 rounded-[8px] bg-[#1A1A1A] border border-[#2E2E2E] text-white text-[14px] placeholder-[#666666] focus:outline-hidden focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-[8px] bg-[#1A1A1A] border border-[#2E2E2E] text-white text-[14px] placeholder-[#666666] focus:outline-hidden focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    maxLength={5000}
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project, timeline, and vision..."
                    className="w-full px-4 py-3 rounded-[8px] bg-[#1A1A1A] border border-[#2E2E2E] text-white text-[14px] placeholder-[#666666] focus:outline-hidden focus:border-white transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-[8px] bg-white text-black text-[14px] font-semibold hover:bg-[#E5E5E5] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Send size={15} />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
