import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { Bell } from '@phosphor-icons/react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/api/notices/');
      setNotices(data);
    } catch (error) {
      console.error('Failed to fetch notices', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    high: 'bg-red-50 text-red-600',
    medium: 'bg-yellow-50 text-yellow-600',
    low: 'bg-zinc-100 text-zinc-600',
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="notices-page">
        <div className="flex items-center gap-4">
          <Bell size={32} weight="duotone" className="text-[#0047AB]" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Notices & Announcements</h1>
            <p className="text-zinc-500 text-sm">Stay updated with college news</p>
          </div>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                data-testid={`notice-${notice.id}`}
                className="bg-white border border-zinc-200 p-6 transition-all duration-200 hover:bg-zinc-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#0047AB] mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{notice.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[notice.priority]}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <p className="text-zinc-700 mb-3">{notice.content}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>Category: {notice.category}</span>
                      <span>Posted: {new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notices;
