import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { Users, Plus, MagnifyingGlass } from '@phosphor-icons/react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/api/students/');
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.enrollment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-students-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Student Management</h1>
            <p className="text-zinc-500 text-sm">Manage student records</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
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
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Enrollment</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50 transition-colors" data-testid={`student-${student.id}`}>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{student.enrollment_number}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">
                      {student.user?.first_name} {student.user?.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.course}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.semester}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{student.user?.email}</td>
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

export default AdminStudents;
