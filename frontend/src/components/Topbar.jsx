import React, { useContext } from 'react';
import { Bell, Mail, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Topbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 w-full shadow-sm">
            <div className="flex-1">
                {/* Search could go here if needed */}
            </div>

            <div className="flex items-center gap-6">
                <button className="text-slate-400 hover:text-slate-600 transition">
                    <Bell size={20} />
                </button>
                <button className="text-slate-400 hover:text-slate-600 transition">
                    <Mail size={20} />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-slate-700">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                        {/* Placeholder avatar */}
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" />
                    </div>
                    <button onClick={logout} className="text-slate-400 hover:text-red-500 transition ml-2" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
