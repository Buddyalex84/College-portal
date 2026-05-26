import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Row = ({ label, value }) => (
  <div>
    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">{label}</label>
    <div className="text-base text-zinc-900">{value || '—'}</div>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/profile/')
      .then(({ data }) => { if (!cancelled) setProfile(data); })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setError('No student record is linked to your account yet. Please contact your administrator.');
        } else {
          setError('Failed to load your profile.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Profile</h1>
          <p className="text-zinc-500 text-sm">Your personal information</p>
        </div>

        {loading && <div className="text-zinc-500">Loading...</div>}

        {!loading && error && (
          <div className="bg-white border border-zinc-200 rounded-lg p-8 text-sm text-zinc-700">
            {error}
            {user && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Row label="Name" value={`${user.first_name || ''} ${user.last_name || ''}`.trim()} />
                <Row label="Username" value={user.username} />
                <Row label="Email" value={user.email} />
                <Row label="Role" value={user.role} />
              </div>
            )}
          </div>
        )}

        {!loading && profile && (
          <div className="bg-white border border-zinc-200 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Row label="Name" value={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()} />
              <Row label="Username" value={profile.username} />
              <Row label="Email" value={profile.email} />
              <Row label="Phone" value={profile.phone} />
              <Row label="Role" value={profile.role} />
              <Row label="Enrollment Number" value={profile.enrollment_number} />
              <Row label="Course" value={profile.course} />
              <Row label="Year" value={profile.year} />
              <Row label="Semester" value={profile.semester} />
              <Row label="Section" value={profile.section} />
              <div className="md:col-span-2">
                <Row label="Address" value={profile.address} />
              </div>
              <Row label="Parent Contact" value={profile.parent_contact} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;