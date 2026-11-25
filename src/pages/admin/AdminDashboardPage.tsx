import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Project } from '../../types/project';
import { ActivityLog } from '../../types/settings';
import { FolderKanban, Plus, Image as ImageIcon, Eye, CheckCircle, Clock } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projRes, logsRes, inqRes] = await Promise.all([
          fetch('/api/admin/projects').then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/admin/activity?limit=5').then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/admin/contact-messages').then((r) => r.json()).catch(() => ({ success: false })),
        ]);

        if (projRes.success) setProjects(projRes.data);
        if (logsRes.success) setLogs(logsRes.data);
        if (inqRes.success && Array.isArray(inqRes.data)) setInquiriesCount(inqRes.data.length);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const total = projects.length;
  const published = projects.filter((p) => p.status === 'published').length;
  const drafts = projects.filter((p) => p.status === 'draft').length;
  const archived = projects.filter((p) => p.status === 'archived').length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">DASHBOARD</h1>
            <p className="text-[14px] text-[#6B6B6B]">Welcome back, Sanjay. Overview of portfolio state.</p>
          </div>
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-[8px] bg-black text-white text-[13px] font-medium hover:bg-black/90 transition-colors self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>New Project</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 bg-white rounded-[10px] border border-[#E5E5E5] shadow-xs">
            <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">TOTAL WORK</div>
            <div className="text-[32px] font-bold text-[#111111] mt-2">{total}</div>
            <div className="text-[12px] text-[#6B6B6B] mt-1">Across all categories</div>
          </div>

          <div className="p-5 bg-white rounded-[10px] border border-[#E5E5E5] shadow-xs">
            <div className="text-[12px] font-semibold text-emerald-600 uppercase tracking-wider">LIVE / PUBLISHED</div>
            <div className="text-[32px] font-bold text-emerald-700 mt-2">{published}</div>
            <div className="text-[12px] text-[#6B6B6B] mt-1">Visible on website</div>
          </div>

          <div className="p-5 bg-white rounded-[10px] border border-[#E5E5E5] shadow-xs">
            <div className="text-[12px] font-semibold text-amber-600 uppercase tracking-wider">DRAFTS</div>
            <div className="text-[32px] font-bold text-amber-700 mt-2">{drafts}</div>
            <div className="text-[12px] text-[#6B6B6B] mt-1">Unpublished work</div>
          </div>

          <div className="p-5 bg-white rounded-[10px] border border-[#E5E5E5] shadow-xs">
            <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">ARCHIVED</div>
            <div className="text-[32px] font-bold text-[#6B6B6B] mt-2">{archived}</div>
            <div className="text-[12px] text-[#6B6B6B] mt-1">Soft-deleted items</div>
          </div>
        </div>

        {/* Client Inquiries Banner */}
        <div className="p-5 bg-black text-white rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[12px] text-[#8A8A8A] font-semibold uppercase tracking-wider">
              CLIENT INQUIRIES
            </div>
            <div className="text-[18px] font-bold mt-0.5">
              {inquiriesCount} {inquiriesCount === 1 ? 'New Message' : 'Total Messages'} from Contact Form
            </div>
          </div>
          <Link
            to="/admin/inquiries"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-[6px] bg-white text-black text-[13px] font-semibold hover:bg-[#E5E5E5] transition-colors self-start sm:self-auto"
          >
            <span>View Inquiries →</span>
          </Link>
        </div>

        {/* Quick Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Table (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#E5E5E5] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#111111] uppercase tracking-tight">Recent Projects</h2>
              <Link to="/admin/projects" className="text-[13px] text-black hover:underline font-medium">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-[#8A8A8A] uppercase text-[11px] tracking-wider">
                    <th className="pb-3">Project</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {projects.slice(0, 6).map((proj) => (
                    <tr key={proj.id} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="py-3.5 font-medium text-[#111111]">
                        <div className="flex items-center space-x-3">
                          <img
                            src={proj.hero_image}
                            alt=""
                            className="w-9 h-9 rounded-[6px] object-cover bg-[#F5F5F5] border border-[#E5E5E5]"
                          />
                          <div>
                            <div className="font-semibold">{proj.title}</div>
                            <div className="text-[12px] text-[#8A8A8A]">{proj.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#6B6B6B]">{proj.category_name || 'Design'}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase ${
                            proj.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : proj.status === 'draft'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/admin/projects/${proj.id}/edit`}
                          className="text-[12px] text-[#111111] hover:underline font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Logs (1 col) */}
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#111111] uppercase tracking-tight">Recent Activity</h2>
              <Link to="/admin/activity" className="text-[13px] text-black hover:underline font-medium">
                Log →
              </Link>
            </div>

            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="text-[13px] border-b border-[#E5E5E5] pb-3 last:border-0">
                  <div className="font-semibold text-[#111111]">{log.action}</div>
                  <div className="text-[12px] text-[#6B6B6B] mt-0.5">{log.details}</div>
                  <div className="text-[11px] text-[#8A8A8A] mt-1 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-[13px] text-[#8A8A8A]">No logged activity yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
