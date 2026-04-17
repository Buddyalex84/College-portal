import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBot from './ChatBot';
import { 
  House, 
  User, 
  Bell, 
  CalendarCheck, 
  ChartBar, 
  CalendarDots, 
  Backpack, 
  CreditCard, 
  ChatCircleDots, 
  Users, 
  Megaphone, 
  FileText, 
  ClipboardText,
  SignOut
} from '@phosphor-icons/react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const studentNav = [
    { path: '/', icon: House, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/notices', icon: Bell, label: 'Notices' },
    { path: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/marks', icon: ChartBar, label: 'Marks' },
    { path: '/timetable', icon: CalendarDots, label: 'Timetable' },
    { path: '/assignments', icon: Backpack, label: 'Assignments' },
    { path: '/fees', icon: CreditCard, label: 'Fees' },
    { path: '/queries', icon: ChatCircleDots, label: 'Queries' },
  ];

  const adminNav = [
    { path: '/', icon: House, label: 'Dashboard' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/notices', icon: Megaphone, label: 'Notices' },
    { path: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/admin/marks', icon: ChartBar, label: 'Marks' },
    { path: '/admin/assignments', icon: FileText, label: 'Assignments' },
    { path: '/admin/queries', icon: ClipboardText, label: 'Queries' },
  ];

  const navItems = user?.role === 'admin' ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-64 bg-zinc-950 flex flex-col fixed h-full">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-black text-white font-cabinet tracking-tight">College Portal</h1>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">{user?.role}</p>
        </div>
        
        <nav className="flex-1 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white border-l-2 border-[#0047AB]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-md transition-colors"
          >
            <SignOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-zinc-200 bg-white/80 backdrop-blur-xl px-8">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-zinc-900">Welcome, {user?.first_name || user?.username}</h2>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
      
      {/* AI ChatBot Assistant */}
      <ChatBot />
    </div>
  );
};

export default Layout;
