import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Mail, Trash2, Calendar, User, MessageSquare, Tag } from 'lucide-react';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data } = await axiosInstance.get('/submissions');
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await axiosInstance.delete(`/submissions/${id}`);
      setSubmissions(submissions.filter(s => s._id !== id));
    } catch (error) {
      console.error('Failed to delete submission', error);
      alert('Failed to delete inquiry.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Inquiries & Form Submissions</h1>
        <p className="text-gray-400 mt-2">Manage contact messages sent by visitors to your portfolio website.</p>
      </header>

      {submissions.length === 0 ? (
        <div className="glass-dark p-12 rounded-2xl border border-gray-800 text-center text-gray-400">
          <Mail size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-lg font-medium">No inquiries received yet.</p>
          <p className="text-sm text-gray-500 mt-1">When users submit your contact form, their messages will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((sub) => (
            <div key={sub._id} className="glass-dark p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(sub._id)}
                  className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 shadow-md"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-4 pb-4 border-b border-gray-900/60">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <User size={16} className="text-indigo-400" />
                  <span>{sub.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail size={14} className="text-purple-400" />
                  <a href={`mailto:${sub.email}`} className="hover:text-indigo-300 underline transition-colors">{sub.email}</a>
                </div>
                {sub.category && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Tag size={10} />
                    <span>{sub.category}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500 text-xs ml-auto">
                  <Calendar size={12} />
                  <span>{new Date(sub.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-gray-300">
                <MessageSquare size={16} className="text-gray-500 mt-1 shrink-0" />
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{sub.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
