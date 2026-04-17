import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { Users, Megaphone, ChatCircleDots, FileText } from '@phosphor-icons/react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/dashboard/');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: 'blue' },
    { label: 'Total Notices', value: stats?.total_notices || 0, icon: Megaphone, color: 'purple' },
    { label: 'Open Queries', value: stats?.open_queries || 0, icon: ChatCircleDots, color: 'orange' },
    { label: 'Pending Submissions', value: stats?.pending_submissions || 0, icon: FileText, color: 'red' },
  ];

  return (
    <Layout>
      <div className="space-y-8" data-testid="admin-dashboard">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-900 leading-none font-cabinet mb-2">
            Admin Dashboard
          </h1>
          <p className="text-zinc-500">Manage college operations efficiently</p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  data-testid={`metric-${metric.label.toLowerCase().replace(/\s/g, '-')}`}
                  className="bg-white border border-zinc-200 rounded-lg p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon size={32} weight="duotone" className={`text-${metric.color}-600`} />
                  </div>
                  <div className="text-5xl font-black tracking-tighter text-zinc-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {metric.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
