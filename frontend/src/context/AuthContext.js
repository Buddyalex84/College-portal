import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from localStorage (NO API)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ❌ Removed API checkAuth

  // ✅ Simple login (NO API)
  const login = async (username, password) => {
    const demoUser = {
      username: username || "demo",
      role: "student"
    };

    localStorage.setItem('user', JSON.stringify(demoUser));
    setUser(demoUser);

    return { user: demoUser };
  };

  // ✅ Simple register (optional)
  const register = async (userData) => {
    const newUser = {
      username: userData.username || "demo",
      role: "student"
    };

    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);

    return { user: newUser };
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};