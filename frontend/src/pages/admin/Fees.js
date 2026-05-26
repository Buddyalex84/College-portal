import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { Plus } from '@phosphor-icons/react';

const EMPTY = {
  student: '',
  semester: 1,
  total_amount: '',
  paid_amount: 0,
  due_date: new Date().toISOString().slice(0, 10),
  payment_status: 'pending',
};

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = useCallback(async () => {
    try {
      const { data } = await api.get('/api/fees/');
      setFees(data);
    } catch {
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
    api.get('/api/students/').then(({ data }) => setStudents(data)).catch(() => {});
  }, [fetchFees]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        student: Number(form.student),
        semester: Number(form.semester),
        total_amount: Number(form.total_amount),
        paid_amount: Number(form.paid_amount),
      };
      const { data } = await api.post('/api/fees/', payload);
      setFees((prev) => [data, ...prev]);
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Fee record created');
    } catch (error) {
      const errs = error.response?.data;
      const msg = errs && typeof errs === 'object'
        ? Object.entries(errs).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Failed to create fee record';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    paid: 'bg-emerald-50 text-emerald-700',
    partial: 'bg-yellow-50 text-yellow-600',
    pending: 'bg-red-50 text-red-600',
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-fees-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Fees Management</h1>
            <p className="text-zinc-500 text-sm">Create and manage student fee records</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md hover:bg-[#003380]"
            data-testid="toggle-create-fee"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Fee'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="create-fee-form">
            <Select label="Student" name="student" value={form.student} onChange={handleChange} required>
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.username} — {s.user?.first_name} {s.user?.last_name}</option>
              ))}
            </Select>
            <Field label="Semester" name="semester" type="number" min="1" value={form.semester} onChange={handleChange} required />
            <Field label="Due Date" name="due_date" type="date" value={form.due_date} onChange={handleChange} required />
            <Field label="Total Amount" name="total_amount" type="number" min="0" step="0.01" value={form.total_amount} onChange={handleChange} required />
            <Field label="Paid Amount" name="paid_amount" type="number" min="0" step="0.01" value={form.paid_amount} onChange={handleChange} />
            <Select label="Status" name="payment_status" value={form.payment_status} onChange={handleChange} required>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </Select>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md disabled:opacity-50" data-testid="submit-create-fee">
                {submitting ? 'Saving...' : 'Save Fee'}
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
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Sem</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-zinc-50 transition-colors" data-testid={`fee-${f.id}`}>
                    <td className="px-6 py-4 text-sm text-zinc-900">{f.student_name || f.student}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{f.semester}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{new Date(f.due_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">₹{f.total_amount}</td>
                    <td className="px-6 py-4 text-sm text-emerald-700">₹{f.paid_amount}</td>
                    <td className="px-6 py-4 text-sm text-red-600">₹{(f.balance ?? (f.total_amount - f.paid_amount))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[f.payment_status]}`}>
                        {f.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {fees.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-6 text-center text-sm text-zinc-500">No fee records yet.</td></tr>
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

export default AdminFees;
