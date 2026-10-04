import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ActivityLog } from '../../types/settings';
import { History } from 'lucide-react';

export const AdminActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/activity?limit=100')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setLogs(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">ACTIVITY LOG</h1>
          <p className="text-[14px] text-[#6B6B6B]">
            Audit history of publishing, editing, uploads, and administrative actions.
          </p>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-[13px]">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5] text-[#8A8A8A] uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FDFDFD] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#111111]">{log.action}</td>
                    <td className="py-3 px-4 text-[#6B6B6B]">{log.details}</td>
                    <td className="py-3 px-4 text-right font-mono text-[12px] text-[#8A8A8A]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-[#8A8A8A]">
                      No activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
