import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FAKE DATA (NO API)
    const demoAttendance = [
      { id: 1, date: "2026-04-01", subject: "Mathematics", status: "present" },
      { id: 2, date: "2026-04-02", subject: "Physics", status: "absent" },
      { id: 3, date: "2026-04-03", subject: "Computer Science", status: "present" },
      { id: 4, date: "2026-04-04", subject: "English", status: "late" },
      { id: 5, date: "2026-04-05", subject: "Mathematics", status: "present" },
    ];

    const total = demoAttendance.length;
    const present = demoAttendance.filter(a => a.status === "present").length;
    const absent = demoAttendance.filter(a => a.status === "absent").length;
    const late = demoAttendance.filter(a => a.status === "late").length;

    const percentage = total > 0 ? (present / total) * 100 : 0;

    setAttendance(demoAttendance);
    setSummary({
      total,
      present,
      absent,
      late,
      percentage,
    });

    setLoading(false);
  }, []);

  const statusColors = {
    present: 'bg-emerald-50 text-emerald-700',
    absent: 'bg-red-50 text-red-600',
    late: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <Layout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            Attendance
          </h1>
          <p className="text-zinc-500 text-sm">
            Track your class attendance
          </p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <>
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="bg-white border rounded-lg p-4">
                  <div className="text-2xl font-black">{summary.total}</div>
                  <div className="text-xs text-zinc-500">Total Classes</div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="text-2xl font-black text-emerald-700">{summary.present}</div>
                  <div className="text-xs text-zinc-500">Present</div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="text-2xl font-black text-red-600">{summary.absent}</div>
                  <div className="text-xs text-zinc-500">Absent</div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="text-2xl font-black text-blue-600">
                    {summary.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-zinc-500">Percentage</div>
                </div>

              </div>
            )}

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-zinc-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs text-zinc-500">Subject</th>
                    <th className="px-6 py-3 text-left text-xs text-zinc-500">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-zinc-50">

                      <td className="px-6 py-4 text-sm">
                        {new Date(record.date).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {record.subject}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[record.status]}`}>
                          {record.status}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;