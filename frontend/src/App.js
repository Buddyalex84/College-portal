import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Notices from './pages/Notices';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Fees from './pages/Fees';
import Queries from './pages/Queries';

import AdminStudents from './pages/admin/Students';
import AdminNotices from './pages/admin/Notices';
import AdminAttendance from './pages/admin/Attendance';
import AdminMarks from './pages/admin/Marks';
import AdminFees from './pages/admin/Fees';
import AdminAssignments from './pages/admin/Assignments';
import AdminQueries from './pages/admin/Queries';

// Resolve the landing page based on the authenticated user's role
function RoleHome() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RoleHome />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/queries" element={<Queries />} />

        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/notices" element={<AdminNotices />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/marks" element={<AdminMarks />} />
        <Route path="/admin/fees" element={<AdminFees />} />
        <Route path="/admin/assignments" element={<AdminAssignments />} />
        <Route path="/admin/queries" element={<AdminQueries />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;