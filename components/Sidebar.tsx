
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../constants';
import { UserProfile } from '../types';
import { LogOut, Sparkles } from 'lucide-react';

interface SidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-indigo-500 p-2 rounded-xl text-white">
            <Sparkles size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Kids-Time
          </h1>
        </div>

        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="px-4 py-2 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">사용자</p>
          <p className="text-sm text-slate-700 truncate font-medium">{user.email}</p>
        </div>
        <button
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
