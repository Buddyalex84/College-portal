import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { ChartBar } from '@phosphor-icons/react';

const AdminMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const { data } = await api.get('/api/marks/');
      setMarks(data);
    } catch (error) {
      console.error('Failed to fetch marks', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-marks-page">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Marks Management</h1>
          <p className="text-zinc-500 text-sm">View and manage student marks</p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Exam Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {marks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-zinc-50 transition-colors" data-testid={`mark-${mark.id}`}>
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.student}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.subject}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.exam_type}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                      {mark.obtained_marks}/{mark.total_marks}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminMarks;
