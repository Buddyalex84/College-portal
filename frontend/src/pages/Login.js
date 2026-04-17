import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SignIn } from '@phosphor-icons/react';
import api from '../api/axios'; // ✅ IMPORTANT

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Login clicked");

      // ✅ CALL BACKEND API
      const { data } = await api.post('/api/auth/login/', {
        username,
        password,
      });

      // ✅ STORE TOKENS
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      console.log("Login success");

      toast.success('Login successful!');

      // ✅ REDIRECT
      window.location.href = "/";

    } catch (error) {
      console.log("ERROR:", error.response?.data);

      toast.error(
        error.response?.data?.error || 'Invalid username or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.pexels.com/photos/15316912/pexels-photo-15316912.jpeg"
          alt="Campus"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-12 left-12 text-white">
          <h1 className="text-5xl font-black mb-2">College Portal</h1>
          <p className="text-lg">Access all your academic resources</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-black mb-2">Welcome Back</h2>
          <p className="text-zinc-500 mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Username / Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-md"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-md"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center">
            Don’t have an account?{' '}
            <Link to="/register" className="text-blue-600">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;