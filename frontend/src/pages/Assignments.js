import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'sonner';
import { Backpack, Upload } from '@phosphor-icons/react';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        api.get('/api/assignments/'),
        api.get('/api/submissions/')
      ]);
      setAssignments(assignmentsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('assignment', selectedAssignment.id);
    formData.append('file', file);
    formData.append('comments', comments);

    try {
      await api.post('/api/submissions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Assignment submitted successfully!');
      setSelectedAssignment(null);
      setFile(null);
      setComments('');
      fetchData();
    } catch (error) {
      toast.error('Failed to submit assignment');
    }
  };

  const isSubmitted = (assignmentId) => {
    return submissions.some(s => s.assignment === assignmentId);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="assignments-page">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Assignments</h1>
          <p className="text-zinc-500 text-sm">View and submit assignments</p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => {
              const submitted = isSubmitted(assignment.id);
              return (
                <div
                  key={assignment.id}
                  data-testid={`assignment-${assignment.id}`}
                  className="bg-white border border-zinc-200 rounded-lg p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-2">{assignment.title}</h3>
                  <p className="text-zinc-700 mb-4">{assignment.description}</p>
                  
                  <div className="space-y-2 text-sm text-zinc-600 mb-4">
                    <div><span className="font-semibold">Subject:</span> {assignment.subject}</div>
                    <div><span className="font-semibold">Due Date:</span> {new Date(assignment.due_date).toLocaleDateString()}</div>
                    <div><span className="font-semibold">Total Marks:</span> {assignment.total_marks}</div>
                  </div>
                  
                  {submitted ? (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      Submitted
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      data-testid={`submit-btn-${assignment.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0047AB] text-white font-semibold text-sm rounded-md transition-all duration-200 hover:bg-[#003380]"
                    >
                      <Upload size={16} />
                      Submit
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-zinc-900 mb-4">Submit Assignment</h3>
              <p className="text-zinc-600 mb-6">{selectedAssignment.title}</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    data-testid="assignment-file-input"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    data-testid="assignment-comments"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3 text-sm h-24"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    data-testid="submit-assignment-btn"
                    className="flex-1 px-4 py-2 bg-[#0047AB] text-white font-semibold text-sm rounded-md hover:bg-[#003380]"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
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

export default Assignments;
