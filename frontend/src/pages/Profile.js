import React from 'react';
import Layout from '../components/Layout';

const Profile = () => {

  // ✅ FAKE DEMO STUDENT DATA (ALWAYS SHOW)
  const profile = {
    first_name: "Rajesh",
    last_name: "Rajput",
    email: "rajesh@student.com",
    phone: "9999999999",
    role: "student",
    enrollment_number: "CSE2024001",
    course: "B.Tech CSE",
    semester: 6,
    section: "A",
    address: "Indore, Madhya Pradesh",
    parent_contact: "8888888888"
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Profile
          </h1>
          <p className="text-zinc-500 text-sm">
            Your personal information
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Name
              </label>
              <div className="text-base text-zinc-900">
                {profile.first_name} {profile.last_name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Email
              </label>
              <div className="text-base text-zinc-900">
                {profile.email}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Phone
              </label>
              <div className="text-base text-zinc-900">
                {profile.phone}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Role
              </label>
              <div className="text-base text-zinc-900 capitalize">
                {profile.role}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Enrollment Number
              </label>
              <div className="text-base text-zinc-900">
                {profile.enrollment_number}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Course
              </label>
              <div className="text-base text-zinc-900">
                {profile.course}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Semester
              </label>
              <div className="text-base text-zinc-900">
                {profile.semester}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Section
              </label>
              <div className="text-base text-zinc-900">
                {profile.section}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Address
              </label>
              <div className="text-base text-zinc-900">
                {profile.address}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Parent Contact
              </label>
              <div className="text-base text-zinc-900">
                {profile.parent_contact}
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Profile;