import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const Marks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/marks/')
      .then(({ data }) => { if (!cancelled) setMarks(data); })
      .catch(() => { if (!cancelled) setMarks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const getPercentage = (obtained, total) => {
    return ((obtained / total) * 100).toFixed(1);
  };

  return (
    <Layout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            Marks & Results
          </h1>
          <p className="text-zinc-500 text-sm">
            View your exam scores
          </p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">

            <table className="w-full">

              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500">Subject</th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500">Exam Type</th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500">Marks Obtained</th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500">Total Marks</th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500">Percentage</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {marks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-zinc-50">

                    <td className="px-6 py-4 text-sm font-medium">
                      {mark.subject}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {mark.exam_type}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {mark.obtained_marks}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {mark.total_marks}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      {getPercentage(mark.obtained_marks, mark.total_marks)}%
                    </td>

                  </tr>
                ))}
                {marks.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-6 text-center text-sm text-zinc-500">No marks recorded yet.</td></tr>
                )}
              </tbody>

            </table>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marks;