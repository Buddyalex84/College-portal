import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { Plus } from '@phosphor-icons/react';

const EMPTY = { student: '', subject: '', exam_type: 'Mid Term', obtained_marks: '', total_marks: 100, semester: 1 };

const AdminMarks = () => {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchMarks = useCallback(async () => {
    try {
      const { data } = await api.get('/api/marks/');
      setMarks(data);
    } catch {
      toast.error('Failed to fetch marks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarks();
    api.get('/api/students/').then(({ data }) => setStudents(data)).catch(() => {});
  }, [fetchMarks]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        student: Number(form.student),
        obtained_marks: Number(form.obtained_marks),
        total_marks: Number(form.total_marks),
        semester: Number(form.semester),
      };
      const { data } = await api.post('/api/marks/', payload);
      setMarks((prev) => [data, ...prev]);
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Marks recorded');
    } catch (error) {
      const errs = error.response?.data;
      const msg = errs && typeof errs === 'object'
        ? Object.entries(errs).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Failed to record marks';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-marks-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Marks Management</h1>
            <p className="text-zinc-500 text-sm">View and manage student marks</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md hover:bg-[#003380]"
            data-testid="toggle-create-marks"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Marks'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="create-marks-form">
            <Select label="Student" name="student" value={form.student} onChange={handleChange} required>
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.username} — {s.user?.first_name} {s.user?.last_name}</option>
              ))}
            </Select>
            <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} required />
            <Select label="Exam Type" name="exam_type" value={form.exam_type} onChange={handleChange} required>
              <option value="Mid Term">Mid Term</option>
              <option value="Final">Final</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
            </Select>
            <Field label="Obtained Marks" name="obtained_marks" type="number" min="0" value={form.obtained_marks} onChange={handleChange} required />
            <Field label="Total Marks" name="total_marks" type="number" min="1" value={form.total_marks} onChange={handleChange} required />
            <Field label="Semester" name="semester" type="number" min="1" value={form.semester} onChange={handleChange} required />
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md disabled:opacity-50" data-testid="submit-create-marks">
                {submitting ? 'Saving...' : 'Save Marks'}
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
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.student_name || mark.student}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.subject}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.exam_type}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                      {mark.obtained_marks}/{mark.total_marks}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{mark.semester}</td>
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

export default AdminMarks;
