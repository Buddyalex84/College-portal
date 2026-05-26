import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { Plus, MagnifyingGlass, Eye, EyeSlash } from '@phosphor-icons/react';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  course: '',
  year: 1,
  semester: 1,
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await api.get('/api/students/');
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        semester: Number(form.semester),
      };
      const { data } = await api.post('/api/students/', payload);
      setStudents((prev) => [...prev, data]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Student created');
    } catch (error) {
      const errs = error.response?.data;
      const msg = errs && typeof errs === 'object'
        ? Object.entries(errs).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Failed to create student';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase();
    return (
      student.enrollment_number?.toLowerCase().includes(q) ||
      student.user?.first_name?.toLowerCase().includes(q) ||
      student.user?.last_name?.toLowerCase().includes(q) ||
      student.user?.username?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-students-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Student Management</h1>
            <p className="text-zinc-500 text-sm">Create and manage student accounts</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md hover:bg-[#003380]"
            data-testid="toggle-create-student"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'New Student'}
          </button>
        </div>

        {showForm && (
          // autoComplete="off" + a hidden dummy username/password pair stops
          // Chrome/Safari/Firefox from autofilling the admin's own saved
          // credentials into the new-student fields below.
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="bg-white border border-zinc-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            data-testid="create-student-form"
          >
            <input type="text" name="prevent_autofill_user" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
            <input type="password" name="prevent_autofill_pass" autoComplete="current-password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

            <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required autoComplete="off" />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required autoComplete="off" />
            <Field label="Username" name="new_student_username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required autoComplete="off" />
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new_student_password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="new-password"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-4 pr-10 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  data-testid="new-student-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-900"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="off" />
            <Field label="Mobile No" name="phone" value={form.phone} onChange={handleChange} autoComplete="off" />
            <Field label="Course" name="course" value={form.course} onChange={handleChange} required autoComplete="off" />
            <Field label="Year" name="year" type="number" min="1" value={form.year} onChange={handleChange} required autoComplete="off" />
            <Field label="Semester" name="semester" type="number" min="1" value={form.semester} onChange={handleChange} required autoComplete="off" />
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#0047AB] text-white text-sm font-semibold rounded-md disabled:opacity-50"
                data-testid="submit-create-student"
              >
                {submitting ? 'Saving...' : 'Save Student'}
              </button>
            </div>
          </form>
        )}

        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            data-testid="search-students"
            className="w-full pl-10 bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Sem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50 transition-colors" data-testid={`student-${student.id}`}>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{student.user?.username}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.user?.first_name} {student.user?.last_name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.user?.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.course}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.year}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.semester}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-zinc-500">No students yet. Click “New Student” to create one.</td></tr>
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
    <input
      {...props}
      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
    />
  </label>
);

export default AdminStudents;
