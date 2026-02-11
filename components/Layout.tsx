import React from 'react';
import { Shield, LayoutDashboard, Flag, AlertCircle, FileText, LogOut } from 'lucide-react';
import { RelevanceStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string, email: string } | null;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'all', label: 'All Reviews', icon: FileText },
    { id: RelevanceStatus.IRRELEVANT, label: 'Flagged', icon: AlertCircle },
    { id: RelevanceStatus.NEEDS_REVIEW, label: 'Needs Review', icon: Flag },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="text-blue-500" size={28} />
            <span className="text-xl font-bold tracking-tight">ReviewShield</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          {user && (
            <div className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2 hover:bg-slate-800 rounded-lg"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};