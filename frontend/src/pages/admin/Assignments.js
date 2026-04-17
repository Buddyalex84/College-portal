import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { toast } from 'sonner';
import { FileText, Plus } from '@phosphor-icons/react';

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    course: '',
    semester: '',
    due_date: '',
    total_marks: ''
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/api/assignments/');
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/assignments/', formData);
      toast.success('Assignment created successfully!');
      setFormData({
        title: '',
        description: '',
        subject: '',
        course: '',
        semester: '',
        due_date: '',
        total_marks: ''
      });
      setShowForm(false);
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/api/assignments/${id}/`);
        toast.success('Assignment deleted successfully!');
        fetchAssignments();
      } catch (error) {
        toast.error('Failed to delete assignment');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-assignments-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Assignment Management</h1>
            <p className="text-zinc-500 text-sm">Create and manage assignments</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            data-testid="create-assignment-button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0047AB] text-white font-semibold text-sm rounded-md transition-all duration-200 hover:bg-[#003380]"
          >
            <Plus size={20} weight="bold" />
            Create Assignment
          </button>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                data-testid={`assignment-${assignment.id}`}
                className="bg-white border border-zinc-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{assignment.title}</h3>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    data-testid={`delete-assignment-${assignment.id}`}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-zinc-700 mb-4">{assignment.description}</p>
                <div className="space-y-1 text-sm text-zinc-600">
                  <div><span className="font-semibold">Subject:</span> {assignment.subject}</div>
                  <div><span className="font-semibold">Course:</span> {assignment.course}</div>
                  <div><span className="font-semibold">Semester:</span> {assignment.semester}</div>
                  <div><span className="font-semibold">Due:</span> {new Date(assignment.due_date).toLocaleDateString()}</div>
                  <div><span className="font-semibold">Marks:</span> {assignment.total_marks}</div>
                  <div><span className="font-semibold">Submissions:</span> {assignment.submission_count || 0}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Create New Assignment</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="assignment-form">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="assignment-title"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="assignment-description"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm h-24"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    data-testid="assignment-subject"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Course</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    data-testid="assignment-course"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Semester</label>
                    <input
                      type="number"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      data-testid="assignment-semester"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Total Marks</label>
                    <input
                      type="number"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                      data-testid="assignment-marks"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    data-testid="assignment-due-date"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    data-testid="submit-assignment-btn"
                    className="flex-1 px-4 py-2 bg-[#0047AB] text-white font-semibold text-sm rounded-md hover:bg-[#003380]"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    data-testid="cancel-assignment-btn"
                    className="flex-1 px-4 py-2 bg-white border border-zinc-300 text-zinc-900 font-semibold text-sm rounded-md hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminAssignments;
