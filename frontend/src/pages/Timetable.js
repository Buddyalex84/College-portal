import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { CalendarDots } from '@phosphor-icons/react';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const { data } = await api.get('/api/timetable/');
      setTimetable(data);
    } catch (error) {
      console.error('Failed to fetch timetable', error);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const groupedByDay = timetable.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-6" data-testid="timetable-page">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Timetable</h1>
          <p className="text-zinc-500 text-sm">Your weekly class schedule</p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Time</th>
                    {days.map((day) => (
                      <th key={day} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {Array.from(new Set(timetable.map(t => t.time_slot))).sort().map((timeSlot) => (
                    <tr key={timeSlot} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-zinc-900 whitespace-nowrap">{timeSlot}</td>
                      {days.map((day) => {
                        const session = groupedByDay[day]?.find(s => s.time_slot === timeSlot);
                        return (
                          <td key={`${day}-${timeSlot}`} className="px-4 py-4 text-sm">
                            {session ? (
                              <div>
                                <div className="font-semibold text-zinc-900">{session.subject}</div>
                                <div className="text-xs text-zinc-500">{session.faculty}</div>
                                <div className="text-xs text-zinc-500">{session.room}</div>
                              </div>
                            ) : (
                              <div className="text-zinc-400">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Timetable;
