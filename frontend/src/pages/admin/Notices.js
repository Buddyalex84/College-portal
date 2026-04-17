import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { Megaphone, Plus } from '@phosphor-icons/react';

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium'
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/notices/', formData);
      toast.success('Notice created successfully!');
      setFormData({ title: '', content: '', category: 'general', priority: 'medium' });
      setShowForm(false);
      fetchNotices();
    } catch (error) {
      toast.error('Failed to create notice');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/api/notices/${id}/`);
        toast.success('Notice deleted successfully!');
        fetchNotices();
      } catch (error) {
        toast.error('Failed to delete notice');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-notices-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Notice Management</h1>
            <p className="text-zinc-500 text-sm">Create and manage notices</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            data-testid="create-notice-button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0047AB] text-white font-semibold text-sm rounded-md transition-all duration-200 hover:bg-[#003380]"
          >
            <Plus size={20} weight="bold" />
            Create Notice
          </button>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                data-testid={`notice-${notice.id}`}
                className="bg-white border border-zinc-200 p-6 flex items-start justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-2">{notice.title}</h3>
                  <p className="text-zinc-700 mb-3">{notice.content}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Category: {notice.category}</span>
                    <span>Priority: {notice.priority}</span>
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notice.id)}
                  data-testid={`delete-notice-${notice.id}`}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Create New Notice</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="notice-form">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="notice-title"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    data-testid="notice-content"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm h-32"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      data-testid="notice-category"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                    >
                      <option value="academic">Academic</option>
                      <option value="exam">Exam</option>
                      <option value="event">Event</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      data-testid="notice-priority"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    data-testid="submit-notice-btn"
                    className="flex-1 px-4 py-2 bg-[#0047AB] text-white font-semibold text-sm rounded-md hover:bg-[#003380]"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    data-testid="cancel-notice-btn"
                    className="flex-1 px-4 py-2 bg-white border border-zinc-300 text-zinc-900 font-semibold text-sm rounded-md hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminNotices;
