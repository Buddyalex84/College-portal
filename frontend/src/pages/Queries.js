import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'sonner';
import { ChatCircleDots, PaperPlaneTilt } from '@phosphor-icons/react';

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: '', description: '' });

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const { data } = await api.get('/api/queries/');
      setQueries(data);
    } catch (error) {
      console.error('Failed to fetch queries', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/queries/', formData);
      toast.success('Query submitted successfully!');
      setFormData({ subject: '', description: '' });
      setShowForm(false);
      fetchQueries();
    } catch (error) {
      toast.error('Failed to submit query');
    }
  };

  const statusColors = {
    open: 'bg-yellow-50 text-yellow-600',
    in_progress: 'bg-blue-50 text-blue-600',
    resolved: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="queries-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Queries & Complaints</h1>
            <p className="text-zinc-500 text-sm">Submit and track your queries</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            data-testid="new-query-button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0047AB] text-white font-semibold text-sm rounded-md transition-all duration-200 hover:bg-[#003380]"
          >
            <PaperPlaneTilt size={20} />
            New Query
          </button>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <div
                key={query.id}
                data-testid={`query-${query.id}`}
                className="bg-white border border-zinc-200 rounded-lg p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{query.subject}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[query.status]}`}>
                    {query.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-zinc-700 mb-4">{query.description}</p>
                
                {query.admin_response && (
                  <div className="bg-blue-50 border-l-2 border-[#0047AB] p-4 mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Admin Response</div>
                    <p className="text-zinc-900">{query.admin_response}</p>
                  </div>
                )}
                
                <div className="text-xs text-zinc-500 mt-3">
                  Submitted on {new Date(query.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Submit New Query</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="query-form">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    data-testid="query-subject"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="query-description"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm h-32 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    data-testid="submit-query-btn"
                    className="flex-1 px-4 py-2 bg-[#0047AB] text-white font-semibold text-sm rounded-md hover:bg-[#003380]"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    data-testid="cancel-query-btn"
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

export default Queries;
