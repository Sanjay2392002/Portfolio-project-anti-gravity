import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Mail, Trash2, Reply, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  read?: boolean;
}

export const AdminInquiriesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/contact-messages');
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.data)) throw new Error(data.error || 'Could not load inquiries.');
      setMessages(data.data);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete inquiry from "${name}"?`)) return;

    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/contact-messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not delete inquiry.');
      setFeedback('Inquiry deleted.');
      await loadMessages();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete inquiry.');
    }
  };

  const handleReadChange = async (message: ContactMessage) => {
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/contact-messages/${encodeURIComponent(message.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !message.read }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not update inquiry.');
      setMessages((items) => items.map((item) => item.id === message.id ? { ...item, read: !message.read } : item));
      setFeedback(message.read ? 'Inquiry marked unread.' : 'Inquiry marked read.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update this inquiry. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-[1000px] pb-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">CONTACT INQUIRIES</h1>
            <p className="text-[14px] text-[#6B6B6B]">
              Direct project inquiries received from the portfolio contact form.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-black text-white text-[12px] font-semibold font-mono">
            {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-[6px]">
            {feedback}
          </div>
        )}
        {error && <div role="alert" className="rounded-[6px] border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}

        {loading ? (
          <div className="py-20 text-center text-[#8A8A8A]">Loading inquiries...</div>
        ) : messages.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[12px] border border-[#E5E5E5] p-8">
            <MessageSquare size={36} className="mx-auto text-[#BBBBBB] mb-3 stroke-[1.5]" />
            <h3 className="text-[18px] font-bold text-[#111111] uppercase tracking-tight">No inquiries yet</h3>
            <p className="text-[14px] text-[#6B6B6B] mt-1">
              Client messages submitted through your website's contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-6 bg-white rounded-[12px] border border-[#E5E5E5] space-y-4 shadow-xs hover:border-[#CCCCCC] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F0F0]">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111111]">{msg.name}</h3>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-[13.5px] text-[#555555] hover:text-black font-medium inline-flex items-center space-x-1"
                    >
                      <Mail size={13} />
                      <span>{msg.email}</span>
                    </a>
                  </div>

                  <div className="flex items-center space-x-3 text-[12px] text-[#8A8A8A]">
                    <button type="button" onClick={() => void handleReadChange(msg)} className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[#f5f5f5]">
                      <CheckCircle2 size={13} /> {msg.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <span className="inline-flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{new Date(msg.created_at).toLocaleString()}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(msg.id, msg.name)}
                      className="p-1.5 rounded-[6px] text-[#8A8A8A] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="text-[14.5px] text-[#333333] leading-relaxed whitespace-pre-wrap bg-[#FAFAFA] p-4 rounded-[8px] border border-[#EEEEEE]">
                  {msg.message}
                </div>

                <div className="flex justify-end">
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent(
                      'Re: Project Inquiry — Sanjay Portfolio'
                    )}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[6px] bg-black text-white text-[12.5px] font-medium hover:bg-black/85 transition-colors"
                  >
                    <Reply size={13} />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
