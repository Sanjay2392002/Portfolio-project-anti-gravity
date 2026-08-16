import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Briefcase, ListTree, Settings, LogOut, Mail } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const links = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/profile', label: 'Profile', icon: <UserCircle size={20} /> },
    { to: '/projects', label: 'Projects', icon: <Briefcase size={20} /> },
    { to: '/sections', label: 'Sections', icon: <ListTree size={20} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    { to: '/submissions', label: 'Inquiries', icon: <Mail size={20} /> },
  ];

  return (
    <aside className="w-64 h-screen glass-dark flex flex-col justify-between fixed top-0 left-0">
      <div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Admin Panel
          </h1>
        </div>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300 shadow-inner' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                }`
              }
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
