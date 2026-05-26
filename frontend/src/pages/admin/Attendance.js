import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { Plus } from '@phosphor-icons/react';

const EMPTY = { student: '', date: new Date().toISOString().slice(0, 10), subject: '', status: 'present' };

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      const { data } = await api.get('/api/attendance/');
      setAttendance(data);
    } catch {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    api.get('/api/students/').then(({ data }) => setStudents(data)).catch(() => {});
  }, [fetchAttendance]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, student: Number(form.student) };
      const { data } = await api.post('/api/attendance/', payload);
      setAttendance((prev) => [data, ...prev]);
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Attendance recorded');
    } catch (error) {
      const errs = error.response?.data;
      const msg = errs && typeof errs === 'object'
        ? Object.entries(errs).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Failed to record attendance';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    present: 'bg-emerald-50 text-emerald-700',
    absent: 'bg-red-50 text-red-600',
    late: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-attendance-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Attendance Management</h1>
            <p className="text-zinc-500 text-sm">View and manage student attendance</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md hover:bg-[#003380]"
            data-testid="toggle-create-attendance"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Attendance'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="create-attendance-form">
            <Select label="Student" name="student" value={form.student} onChange={handleChange} required>
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.username} — {s.user?.first_name} {s.user?.last_name}</option>
              ))}
            </Select>
            <Field label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
            <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} required />
            <Select label="Status" name="status" value={form.status} onChange={handleChange} required>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </Select>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md disabled:opacity-50" data-testid="submit-create-attendance">
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-50 transition-colors" data-testid={`attendance-${record.id}`}>
                    <td className="px-6 py-4 text-sm text-zinc-900">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{record.student_name || record.student}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{record.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-6 text-center text-sm text-zinc-500">No attendance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{label}</span>
    <input {...props} className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent" />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label className="block">
    <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{label}</span>
    <select {...props} className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent">
      {children}
    </select>
  </label>
);

export default AdminAttendance;
