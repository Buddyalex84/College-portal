import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { CalendarCheck, ChartBar, Backpack, CreditCard } from '@phosphor-icons/react';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // ✅ DUMMY DATA (NO API)
      const data = {
        attendance_percentage: 60,
        average_marks: 82,
        pending_assignments: 2,
        pending_fees: 1
      };

      // simulate loading delay (optional)
      setTimeout(() => {
        setStats(data);
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error loading stats', error);
      setLoading(false);
    }
  };

  const metrics = [
    { label: 'Attendance', value: stats?.attendance_percentage || 0, suffix: '%', icon: CalendarCheck, color: 'emerald' },
    { label: 'Average Marks', value: stats?.average_marks || 0, suffix: '', icon: ChartBar, color: 'blue' },
    { label: 'Pending Assignments', value: stats?.pending_assignments || 0, suffix: '', icon: Backpack, color: 'orange' },
    { label: 'Pending Fees', value: stats?.pending_fees || 0, suffix: '', icon: CreditCard, color: 'red' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-900 leading-none font-cabinet mb-2">
            Student Dashboard
          </h1>
          <p className="text-zinc-500">Overview of your academic progress</p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="bg-white border border-zinc-200 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Icon size={32} weight="duotone" />
                    </div>
                    <div className="text-5xl font-black text-zinc-900 mb-1">
                      {metric.value}{metric.suffix}
                    </div>
                    <div className="text-xs font-bold uppercase text-zinc-500">
                      {metric.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Welcome Back!</h2>
              <p className="text-zinc-700">
                Stay on top of your academic journey. Check your attendance, review your marks, and submit pending assignments.
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;