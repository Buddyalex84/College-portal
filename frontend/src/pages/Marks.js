import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Marks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FAKE DEMO MARKS DATA
    const demoMarks = [
      {
        id: 1,
        subject: "Mathematics",
        exam_type: "Mid Term",
        obtained_marks: 42,
        total_marks: 50
      },
      {
        id: 2,
        subject: "Physics",
        exam_type: "Mid Term",
        obtained_marks: 38,
        total_marks: 50
      },
      {
        id: 3,
        subject: "Computer Science",
        exam_type: "Final",
        obtained_marks: 85,
        total_marks: 100
      },
      {
        id: 4,
        subject: "English",
        exam_type: "Final",
        obtained_marks: 78,
        total_marks: 100
      }
    ];

    setMarks(demoMarks);
    setLoading(false);
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
              </tbody>

            </table>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marks;