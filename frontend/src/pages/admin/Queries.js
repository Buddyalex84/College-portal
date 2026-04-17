import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { ClipboardText } from '@phosphor-icons/react';

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [response, setResponse] = useState('');

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

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/queries/${selectedQuery.id}/`, {
        admin_response: response,
        status: 'resolved'
      });
      toast.success('Response submitted successfully!');
      setSelectedQuery(null);
      setResponse('');
      fetchQueries();
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  const statusColors = {
    open: 'bg-yellow-50 text-yellow-600',
    in_progress: 'bg-blue-50 text-blue-600',
    resolved: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-queries-page">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Query Management</h1>
          <p className="text-zinc-500 text-sm">Manage student queries and complaints</p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <div
                key={query.id}
                data-testid={`query-${query.id}`}
                className="bg-white border border-zinc-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{query.subject}</h3>
                    <p className="text-sm text-zinc-500 mt-1">By: {query.student_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[query.status]}`}>
                      {query.status.replace('_', ' ')}
                    </span>
                    {query.status === 'open' && (
                      <button
                        onClick={() => setSelectedQuery(query)}
                        data-testid={`respond-btn-${query.id}`}
                        className="px-3 py-1 text-sm bg-[#0047AB] text-white rounded hover:bg-[#003380]"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-zinc-700 mb-4">{query.description}</p>
                
                {query.admin_response && (
                  <div className="bg-blue-50 border-l-2 border-[#0047AB] p-4">
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

        {selectedQuery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-zinc-900 mb-4">Respond to Query</h3>
              <p className="text-zinc-600 mb-6">{selectedQuery.subject}</p>
              
              <form onSubmit={handleRespond} className="space-y-4" data-testid="response-form">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Response
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    data-testid="query-response"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm h-32"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    data-testid="submit-response-btn"
                    className="flex-1 px-4 py-2 bg-[#0047AB] text-white font-semibold text-sm rounded-md hover:bg-[#003380]"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuery(null)}
                    data-testid="cancel-response-btn"
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

export default AdminQueries;
